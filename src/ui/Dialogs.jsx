import { useEffect, useRef, useState } from 'react';
import { MOVIES } from '../data/movies.js';
import { useApp, movieById } from '../store.js';
import { borderById } from '../data/borders.js';
import { deletePhoto, downloadPhoto, sharePhoto } from '../lib/photos.js';

function useModal(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return undefined;
    const handler = () => onClose();
    d.addEventListener('close', handler);
    return () => d.removeEventListener('close', handler);
  }, [onClose]);
  return ref;
}

export function AlbumDialog() {
  const open = useApp((s) => s.albumOpen);
  const photos = useApp((s) => s.collection);
  const setOpen = useApp((s) => s.setAlbumOpen);
  const ref = useModal(open, () => setOpen(false));

  return (
    <dialog ref={ref} className="sheet" aria-labelledby="album-title">
      <div className="sheet-head">
        <h2 id="album-title" className="sheet-title">
          Your photo album
        </h2>
        <p className="sheet-sub">
          {photos.length
            ? `${photos.length} photo${photos.length === 1 ? '' : 's'}, saved on this device.`
            : 'No photos yet.'}
        </p>
        <button type="button" className="key key--small sheet-close" onClick={() => setOpen(false)} aria-label="Close the album">
          <CloseGlyph />
        </button>
      </div>
      {photos.length ? (
        <ul className="album-grid">
          {photos.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                className="album-print"
                style={{ '--tilt': `${((i * 37) % 7) - 3}deg` }}
                onClick={() => useApp.getState().openLightbox(p.id)}
              >
                <img src={p.url} alt="" width={p.width} height={p.height} loading="lazy" />
                <span className="album-caption">
                  <span className="album-caption-title">{p.title}</span>
                  <span className="album-caption-meta">{p.timecode}</span>
                </span>
                <span className="sr-only">Open this photo</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="album-empty">
          While a movie plays, press the camera key on the deck (or S) to keep a moment. Your photos
          land here and come out of the printer when the movie ends.
        </p>
      )}
    </dialog>
  );
}

export function PhotoDialog() {
  const id = useApp((s) => s.lightboxId);
  const photos = useApp((s) => s.collection);
  const close = useApp((s) => s.closeLightbox);
  const ref = useModal(!!id, close);
  const index = photos.findIndex((p) => p.id === id);
  const photo = index >= 0 ? photos[index] : null;
  const [note, setNote] = useState('');
  const canShare = typeof navigator !== 'undefined' && !!navigator.canShare;

  useEffect(() => setNote(''), [id]);

  const go = (dir) => {
    if (!photos.length) return;
    const next = photos[(index + dir + photos.length) % photos.length];
    useApp.getState().openLightbox(next.id);
  };

  const remove = async () => {
    if (!photo) return;
    const next = photos[index + 1] ?? photos[index - 1] ?? null;
    await deletePhoto(photo.id);
    URL.revokeObjectURL(photo.url);
    useApp.getState().removePhoto(photo.id);
    useApp.getState().announce('Photo deleted.');
    if (next) useApp.getState().openLightbox(next.id);
  };

  const share = async () => {
    try {
      const ok = await sharePhoto(photo);
      if (!ok) {
        downloadPhoto(photo);
        setNote('Sharing isn’t available here, so the photo was downloaded instead.');
      }
    } catch {
      /* the person closed the share sheet */
    }
  };

  return (
    <dialog
      ref={ref}
      className="viewer"
      aria-labelledby="viewer-title"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
    >
      {photo && (
        <>
          <figure className="viewer-figure">
            <img src={photo.url} alt={`${photo.title} at ${photo.timecode}, in the ${borderById(photo.borderId).name} frame`} width={photo.width} height={photo.height} />
            <figcaption>
              <span id="viewer-title" className="viewer-title">
                {photo.title}
              </span>
              <span className="viewer-meta">
                {photo.timecode} in the movie. {new Date(photo.createdAt).toLocaleString()}
              </span>
              {movieById(photo.movieId)?.credit && (
                <span className="viewer-meta">
                  {movieById(photo.movieId).credit}, {movieById(photo.movieId).license}
                </span>
              )}
            </figcaption>
          </figure>
          <div className="viewer-actions">
            <button type="button" className="key key--wide key--cherry" onClick={() => downloadPhoto(photo)}>
              Download
            </button>
            {canShare && (
              <button type="button" className="key key--wide" onClick={share}>
                Share
              </button>
            )}
            {photos.length > 1 && (
              <>
                <button type="button" className="key" onClick={() => go(-1)} aria-label="Previous photo">
                  ‹
                </button>
                <button type="button" className="key" onClick={() => go(1)} aria-label="Next photo">
                  ›
                </button>
              </>
            )}
            <button type="button" className="key key--wide key--quiet" onClick={remove}>
              Delete
            </button>
            <button type="button" className="key key--small viewer-close" onClick={close} aria-label="Close the photo">
              <CloseGlyph />
            </button>
          </div>
          <p className="viewer-note" role="status">
            {note}
          </p>
        </>
      )}
    </dialog>
  );
}

const CloseGlyph = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="icon">
    <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

/** Without WebGL the booth still works: tapes become buttons, the deck works as normal. */
export function FlatShelf() {
  const phase = useApp((s) => s.phase);
  const webgl = useApp((s) => s.webgl);
  const inserted = useApp((s) => s.insertedTapeId);
  const printBatch = useApp((s) => s.printBatch);
  const printing = useApp((s) => s.printing);

  useEffect(() => {
    if (webgl || !printing) return;
    useApp.getState().finishPrint();
    useApp.getState().setAlbumOpen(true);
  }, [webgl, printing, printBatch]);

  if (webgl || phase !== 'inside' || inserted) return null;
  return (
    <section className="flat-shelf" aria-labelledby="flat-title">
      <h2 id="flat-title" className="sheet-title">
        Pick a tape
      </h2>
      <ul>
        {MOVIES.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              className="flat-tape"
              style={{ '--shell': m.colors.shell, '--label': m.colors.label, '--ink': m.colors.ink }}
              onClick={() => useApp.getState().insertTape(m.id)}
            >
              <span className="flat-tape-title">{m.title}</span>
              <span className="flat-tape-note">{m.note}</span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="key key--wide" onClick={() => useApp.setState({ phase: 'outside' })}>
        Step outside
      </button>
    </section>
  );
}
