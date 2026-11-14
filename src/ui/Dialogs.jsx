import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MOVIES } from '../data/movies.js';
import { useApp, movieById } from '../store.js';
import { BORDERS, borderById } from '../data/borders.js';
import { deletePhoto, downloadPhoto, sharePhoto } from '../lib/photos.js';
import { printEach, printStrip } from '../lib/printFlow.js';
import * as I from '../player/icons.jsx';

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

/* ---------- shared pieces: one panel, one Back key, one gallery ---------- */

function BackKey({ onClick, label = 'Back' }) {
  return (
    <button type="button" className="float-btn panel-back" onClick={onClick} data-tip={label} data-key="Esc">
      <I.Back />
      <span>Back</span>
    </button>
  );
}

function PanelHead({ title, sub, onBack, id }) {
  return (
    <header className="panel-head">
      <BackKey onClick={onBack} />
      <div className="panel-titles">
        <h2 id={id} className="panel-title">{title}</h2>
        {sub && <p className="panel-sub">{sub}</p>}
      </div>
      <span className="panel-spacer" aria-hidden="true" />
    </header>
  );
}

/**
 * Every picture at once, as large as the screen allows, with no scrolling.
 * When there are too many to stay readable, they split into pages turned
 * with the ‹ › keys or the arrow keys.
 */
function Gallery({ items, aspect = 1.3, minW = 150, render, label }) {
  const ref = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [page, setPage] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const gap = 14;
  const n = items.length;
  const fit = (count) => {
    let best = { cols: 1, rows: count, size: 0 };
    for (let cols = 1; cols <= count; cols++) {
      const rows = Math.ceil(count / cols);
      const w = (box.w - (cols - 1) * gap) / cols;
      const h = (box.h - (rows - 1) * gap) / rows;
      const size = Math.min(w, h * aspect);
      if (size > best.size) best = { cols, rows, size };
    }
    return best;
  };
  let per = n;
  let layout = fit(n);
  if (box.w && layout.size < minW) {
    const cols = Math.max(1, Math.floor((box.w + gap) / (minW + gap)));
    const rows = Math.max(1, Math.floor((box.h + gap) / (minW / aspect + gap)));
    per = Math.max(1, cols * rows);
    layout = fit(per);
  }
  const pages = Math.max(1, Math.ceil(n / per));
  const p = Math.min(page, pages - 1);
  const shown = items.slice(p * per, p * per + per);
  const turn = (d) => setPage((x) => Math.min(pages - 1, Math.max(0, x + d)));
  return (
    <div
      className="gallery"
      onKeyDown={(e) => {
        if (e.key === 'PageDown' || (e.key === 'ArrowRight' && e.altKey)) turn(1);
        if (e.key === 'PageUp' || (e.key === 'ArrowLeft' && e.altKey)) turn(-1);
      }}
    >
      <div className="gallery-box" ref={ref}>
        {box.w > 0 && (
          <ul className="gallery-grid" aria-label={label} style={{ gridTemplateColumns: `repeat(${layout.cols}, ${Math.floor(layout.size)}px)`, gridAutoRows: `${Math.floor(layout.size / aspect)}px`, gap }}>
            {shown.map((it) => (
              <li key={it.id}>{render(it)}</li>
            ))}
          </ul>
        )}
      </div>
      {pages > 1 && (
        <nav className="gallery-pager" aria-label="Pages">
          <button type="button" className="pb-btn pager-key" onClick={() => turn(-1)} disabled={p === 0} aria-label="Previous page" data-tip="Previous page" data-key="PgUp">
            <I.Chevron back />
          </button>
          <span className="pager-dots" aria-live="polite">
            {Array.from({ length: pages }, (_, i) => (
              <span key={i} className="pager-dot" data-on={i === p || undefined} />
            ))}
            <span className="sr-only">{`Page ${p + 1} of ${pages}`}</span>
          </span>
          <button type="button" className="pb-btn pager-key" onClick={() => turn(1)} disabled={p === pages - 1} aria-label="Next page" data-tip="Next page" data-key="PgDn">
            <I.Chevron />
          </button>
        </nav>
      )}
    </div>
  );
}

export function AlbumDialog() {
  const open = useApp((s) => s.albumOpen);
  const photos = useApp((s) => s.collection);
  const setOpen = useApp((s) => s.setAlbumOpen);
  const ref = useModal(open, () => setOpen(false));
  return (
    <dialog ref={ref} className="panel" aria-labelledby="album-title">
      {open && (
        <>
          <PanelHead id="album-title" title="Album" sub={photos.length ? `${photos.length} kept on this device` : 'Nothing kept yet'} onBack={() => setOpen(false)} />
          {photos.length ? (
            <Gallery
              items={photos}
              label="Prints"
              aspect={1.42}
              minW={140}
              render={(p) => (
                <button type="button" className="tile" onClick={() => useApp.getState().openLightbox(p.id)} data-tip="Open" data-key="Enter">
                  <span className="tile-pic">
                    <img src={p.url} alt="" width={p.width} height={p.height} />
                  </span>
                  <span className="tile-cap">
                    <span>{p.title}</span>
                    <span className="tile-meta">{p.kind === 'strip' ? 'Strip' : p.timecode}</span>
                  </span>
                </button>
              )}
            />
          ) : (
            <p className="panel-empty">Prints you make from your snaps are kept here.</p>
          )}
        </>
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
    else close();
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
      className="panel panel--viewer"
      aria-labelledby="viewer-title"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
    >
      {photo && (
        <>
          <PanelHead
            id="viewer-title"
            title={photo.title}
            sub={`${photo.kind === 'strip' ? 'Photostrip' : `At ${photo.timecode}`} · ${borderById(photo.borderId).name} · ${new Date(photo.createdAt).toLocaleDateString()}`}
            onBack={close}
          />
          <div className="viewer-stage">
            {photos.length > 1 ? (
              <button type="button" className="pb-btn pager-key" onClick={() => go(-1)} aria-label="Previous" data-tip="Previous" data-key="←">
                <I.Chevron back />
              </button>
            ) : <span />}
            <figure className="viewer-pic">
              <img src={photo.url} alt={`${photo.title}, ${photo.kind === 'strip' ? 'photostrip' : `at ${photo.timecode}`}, ${borderById(photo.borderId).name} frame`} width={photo.width} height={photo.height} />
            </figure>
            {photos.length > 1 ? (
              <button type="button" className="pb-btn pager-key" onClick={() => go(1)} aria-label="Next" data-tip="Next" data-key="→">
                <I.Chevron />
              </button>
            ) : <span />}
          </div>
          <footer className="panel-actions">
            {movie && <p className="panel-credit">{movie.credit}, {movie.license}</p>}
            <div className="panel-buttons">
              <button type="button" className="float-btn float-btn--primary" onClick={() => downloadPhoto(photo)} data-tip="Download">
                <I.Download />
                <span>Download</span>
              </button>
              {canShare && (
                <button type="button" className="float-btn" onClick={share} data-tip="Share">
                  <I.Share />
                  <span>Share</span>
                </button>
              )}
              <button type="button" className="float-btn" onClick={remove} data-tip="Delete">
                <I.Trash />
                <span>Delete</span>
              </button>
            </div>
            <p className="panel-note" role="status">{photos.length > 1 ? `${index + 1} of ${photos.length}` : ''}{note ? `  ${note}` : ''}</p>
          </footer>
        </>
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
  const fi = BORDERS.findIndex((b) => b.id === frame);
  const stepFrame = (d) => setFrame(BORDERS[(fi + d + BORDERS.length) % BORDERS.length].id);
  const fb = borderById(frame);

  return (
    <dialog ref={ref} className="panel" aria-labelledby="compiler-title">
      {open && (
        <>
          <PanelHead
            id="compiler-title"
            title="Snaps"
            sub={snaps.length ? `${chosen.length} of ${snaps.length} picked · each one downloaded when you snapped it` : 'Nothing snapped yet'}
            onBack={() => useApp.getState().setCompilerOpen(false)}
          />
          {snaps.length ? (
            <>
              <Gallery
                items={snaps}
                label="Snaps"
                aspect={1.55}
                minW={150}
                render={(p) => (
                  <button type="button" role="checkbox" aria-checked={picked.has(p.id)} className="tile tile--pick" onClick={() => toggle(p.id)} data-tip={picked.has(p.id) ? 'Leave out' : 'Pick'} data-key="Space">
                    <span className="tile-pic">
                      <img src={p.url} alt="" width={p.width} height={p.height} />
                      <span className="tile-check" aria-hidden="true"><I.Check /></span>
                    </span>
                    <span className="tile-cap">
                      <span>{p.title}</span>
                      <span className="tile-meta">{p.timecode}</span>
                    </span>
                    <span className="sr-only">{`${p.title} at ${p.timecode}`}</span>
                  </button>
                )}
              />
              <footer className="panel-actions">
                <div className="panel-buttons">
                  <button type="button" className="float-btn" onClick={() => setPicked(all ? new Set() : new Set(snaps.map((p) => p.id)))} data-tip={all ? 'Pick none' : 'Pick all'}>
                    <I.Check />
                    <span>{all ? 'None' : 'All'}</span>
                  </button>
                  <div className="frame-step" role="group" aria-label="Frame for prints">
                    <button type="button" className="pb-btn pager-key" onClick={() => stepFrame(-1)} aria-label="Previous frame" data-tip="Previous frame">
                      <I.Chevron back />
                    </button>
                    <span className="frame-step-name" aria-live="polite">
                      <span className="frame-chip-swatch" style={{ '--a': fb.swatch[0], '--b': fb.swatch[1] }} aria-hidden="true" />
                      {fb.name}
                    </span>
                    <button type="button" className="pb-btn pager-key" onClick={() => stepFrame(1)} aria-label="Next frame" data-tip="Next frame">
                      <I.Chevron />
                    </button>
                  </div>
                  <button type="button" className="float-btn float-btn--primary" disabled={!chosen.length || !!busy || printing} onClick={() => run('each', () => printEach(chosen, frame))} data-tip="Print each snap in the frame">
                    <I.Print />
                    <span>{busy === 'each' ? 'Printing…' : chosen.length > 1 ? `Print ${chosen.length}` : 'Print'}</span>
                  </button>
                  <button type="button" className="float-btn float-btn--primary" disabled={!stripOk || !!busy || printing} onClick={() => run('strip', () => printStrip(chosen, frame))} data-tip="Stack 2 to 6 into a photostrip">
                    <I.Stack />
                    <span>{busy === 'strip' ? 'Making…' : 'Photostrip'}</span>
                  </button>
                  <button type="button" className="float-btn" disabled={!chosen.length} onClick={() => chosen.forEach((p) => downloadPhoto(p))} data-tip="Download again">
                    <I.Download />
                    <span>Download</span>
                  </button>
                  <button type="button" className="float-btn" disabled={!chosen.length} onClick={() => useApp.getState().removeSnaps(chosen.map((p) => p.id))} data-tip="Remove from snaps">
                    <I.Trash />
                    <span>Remove</span>
                  </button>
                </div>
                <p className="panel-note">{chosen.length > 6 ? 'A photostrip holds 2 to 6 snaps.' : 'Photostrips stack 2 to 6 snaps, top to bottom, in the order you took them.'}</p>
              </footer>
            </>
          ) : (
            <p className="panel-empty">Press Snap while a film plays or is paused. The frame downloads straight away and waits here to be printed.</p>
          )}
        </>
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
