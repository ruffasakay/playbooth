import { useEffect, useRef, useState } from 'react';
import { MOVIES } from '../data/movies.js';
import { useApp, movieById } from '../store.js';
import { BORDERS, borderById } from '../data/borders.js';
import { deletePhoto, downloadPhoto, sharePhoto } from '../lib/photos.js';
import { printEach, printStrip } from '../lib/printFlow.js';

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

const Close = ({ onClick, label }) => (
  <button type="button" className="btn btn--icon sheet-close" onClick={onClick} aria-label={label}>
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  </button>
);

export function AlbumDialog() {
  const open = useApp((s) => s.albumOpen);
  const photos = useApp((s) => s.collection);
  const setOpen = useApp((s) => s.setAlbumOpen);
  const ref = useModal(open, () => setOpen(false));
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="album-title">
      <header className="sheet-head">
        <h2 id="album-title" className="band">Album</h2>
        <p className="sheet-sub">{photos.length ? `${photos.length} kept on this device` : 'Nothing kept yet.'}</p>
        <Close onClick={() => setOpen(false)} label="Close the album" />
      </header>
      {photos.length ? (
        <ul className="album-grid">
          {photos.map((p) => (
            <li key={p.id} data-kind={p.kind || 'photo'}>
              <button type="button" className="album-item" onClick={() => useApp.getState().openLightbox(p.id)}>
                <img src={p.url} alt="" width={p.width} height={p.height} loading="lazy" />
                <span className="album-cap">
                  <span>{p.title}</span>
                  <span className="album-cap-meta">{p.kind === 'strip' ? 'Strip' : p.timecode}</span>
                </span>
                <span className="sr-only">Open</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="album-empty">Photos you take while a film plays are kept here. Every three make a photostrip.</p>
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
    if (photos.length < 2) return;
    useApp.getState().openLightbox(photos[(index + dir + photos.length) % photos.length].id);
  };
  const remove = async () => {
    if (!photo) return;
    const next = photos[index + 1] ?? photos[index - 1] ?? null;
    await deletePhoto(photo.id);
    URL.revokeObjectURL(photo.url);
    useApp.getState().removePhoto(photo.id);
    useApp.getState().announce('Deleted.');
    if (next) useApp.getState().openLightbox(next.id);
  };
  const share = async () => {
    try {
      if (!(await sharePhoto(photo))) {
        downloadPhoto(photo);
        setNote('Sharing isn’t available here, so it was downloaded.');
      }
    } catch {
      /* share sheet closed */
    }
  };
  const movie = photo ? movieById(photo.movieId) : null;

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
        <div className="viewer-layout" data-kind={photo.kind || 'photo'}>
          <div className="viewer-copy">
            <h2 id="viewer-title" className="band band--teal">{photo.title}</h2>
            <p className="viewer-meta">
              {photo.kind === 'strip' ? `Photostrip, ${photo.timecode}` : `At ${photo.timecode}`}
              <br />
              {borderById(photo.borderId).name} frame
              <br />
              {new Date(photo.createdAt).toLocaleString()}
            </p>
            {movie && <p className="viewer-credit">{movie.credit}<br />{movie.license}</p>}
            <div className="viewer-actions">
              <button type="button" className="btn btn--primary" onClick={() => downloadPhoto(photo)}>Download</button>
              {canShare && <button type="button" className="btn" onClick={share}>Share</button>}
              <button type="button" className="btn btn--ghost-dark" onClick={remove}>Delete</button>
            </div>
            {photos.length > 1 && (
              <div className="viewer-nav">
                <button type="button" className="btn btn--icon" onClick={() => go(-1)} aria-label="Previous">‹</button>
                <span>{index + 1} of {photos.length}</span>
                <button type="button" className="btn btn--icon" onClick={() => go(1)} aria-label="Next">›</button>
              </div>
            )}
            <p className="viewer-note" role="status">{note}</p>
          </div>
          <figure className="viewer-figure">
            <img src={photo.url} alt={`${photo.title}, ${photo.kind === 'strip' ? 'photostrip' : `at ${photo.timecode}`}, ${borderById(photo.borderId).name} frame`} width={photo.width} height={photo.height} />
          </figure>
          <Close onClick={close} label="Close" />
        </div>
      )}
    </dialog>
  );
}

/**
 * The compiler: every snap from this visit, ready to print one by one
 * in a frame, or stacked into a photostrip.
 */
export function CompilerDialog() {
  const open = useApp((s) => s.compilerOpen);
  const snaps = useApp((s) => s.snaps);
  const playerBorder = useApp((s) => s.borderId);
  const printing = useApp((s) => s.printing);
  const ref = useModal(open, () => useApp.getState().setCompilerOpen(false));
  const [picked, setPicked] = useState(() => new Set());
  const [frame, setFrame] = useState(playerBorder);
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (!open) return;
    setFrame(useApp.getState().borderId);
    setPicked(new Set(useApp.getState().snaps.map((p) => p.id)));
  }, [open]);

  const chosen = snaps.filter((p) => picked.has(p.id));
  const toggle = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const all = chosen.length === snaps.length && snaps.length > 0;
  const stripOk = chosen.length >= 2 && chosen.length <= 6;
  const run = async (label, fn) => {
    setBusy(label);
    try {
      await fn();
    } finally {
      setBusy('');
    }
  };

  return (
    <dialog ref={ref} className="sheet compiler" aria-labelledby="compiler-title">
      <header className="sheet-head">
        <h2 id="compiler-title" className="band">Snaps</h2>
        <p className="sheet-sub">
          {snaps.length
            ? `${snaps.length} from this visit. Each one also downloaded the moment you snapped it.`
            : 'Nothing snapped yet.'}
        </p>
        <Close onClick={() => useApp.getState().setCompilerOpen(false)} label="Close snaps" />
      </header>

      {snaps.length ? (
        <>
          <div className="compiler-tools">
            <button type="button" className="btn btn--small" onClick={() => setPicked(all ? new Set() : new Set(snaps.map((p) => p.id)))}>
              {all ? 'Select none' : 'Select all'}
            </button>
            <span className="compiler-count" aria-live="polite">{chosen.length} selected</span>
          </div>
          <ul className="compiler-grid">
            {snaps.map((p) => (
              <li key={p.id}>
                <button type="button" role="checkbox" aria-checked={picked.has(p.id)} className="snap-card" onClick={() => toggle(p.id)}>
                  <img src={p.url} alt="" width={p.width} height={p.height} />
                  <span className="snap-check" aria-hidden="true" />
                  <span className="snap-cap">
                    <span>{p.title}</span>
                    <span>{p.timecode}</span>
                  </span>
                  <span className="sr-only">{`${p.title} at ${p.timecode}`}</span>
                </button>
              </li>
            ))}
          </ul>

          <fieldset className="compiler-frames">
            <legend>Frame for prints</legend>
            <div role="radiogroup" aria-label="Frame for prints">
              {BORDERS.map((b) => (
                <button key={b.id} type="button" role="radio" aria-checked={frame === b.id} className="frame-chip" onClick={() => setFrame(b.id)}>
                  <span className="frame-chip-swatch" style={{ '--a': b.swatch[0], '--b': b.swatch[1] }} aria-hidden="true" />
                  {b.name}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="compiler-actions">
            <button type="button" className="btn btn--primary" disabled={!chosen.length || !!busy || printing} onClick={() => run('each', () => printEach(chosen, frame))}>
              {busy === 'each' ? 'Printing…' : chosen.length > 1 ? `Print ${chosen.length} separately` : 'Print'}
            </button>
            <button type="button" className="btn btn--primary" disabled={!stripOk || !!busy || printing} onClick={() => run('strip', () => printStrip(chosen, frame))}>
              {busy === 'strip' ? 'Making…' : 'Make a photostrip'}
            </button>
            <button type="button" className="btn" disabled={!chosen.length} onClick={() => chosen.forEach((p) => downloadPhoto(p))}>
              Download
            </button>
            <button type="button" className="btn btn--ghost-dark" disabled={!chosen.length} onClick={() => useApp.getState().removeSnaps(chosen.map((p) => p.id))}>
              Remove
            </button>
          </div>
          <p className="compiler-note">{chosen.length > 6 ? 'A photostrip holds 2 to 6 snaps.' : 'Photostrips stack 2 to 6 snaps, top to bottom, in the order you took them.'}</p>
        </>
      ) : (
        <p className="album-empty">Press Snap while a film plays or is paused. The frame downloads straight away and waits here to be printed.</p>
      )}
    </dialog>
  );
}

/** Without WebGL the booth still works: the rack becomes a list. */
export function FlatShelf() {
  const phase = useApp((s) => s.phase);
  const webgl = useApp((s) => s.webgl);
  const inserted = useApp((s) => s.insertedTapeId);
  const printing = useApp((s) => s.printing);
  useEffect(() => {
    if (webgl || !printing) return;
    useApp.getState().finishPrint();
    useApp.getState().setAlbumOpen(true);
  }, [webgl, printing]);
  if (webgl || phase !== 'inside' || inserted) return null;
  return (
    <section className="flat-shelf" aria-labelledby="flat-title">
      <h2 id="flat-title" className="band">Films</h2>
      <ul>
        {MOVIES.map((m) => (
          <li key={m.id}>
            <button type="button" className="flat-tape" onClick={() => useApp.getState().insertTape(m.id)}>
              <span className="flat-tape-title">{m.title}</span>
              <span className="flat-tape-note">{m.year}. {m.genre}.</span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn" onClick={() => useApp.setState({ phase: 'outside' })}>Step out</button>
    </section>
  );
}
