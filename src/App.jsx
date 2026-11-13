import { Suspense, lazy, useEffect } from 'react';
import { useApp } from './store.js';
import { loadPhotos } from './lib/photos.js';
import { PlayerLayer } from './player/PlayerLayer.jsx';
import { Announcer, Hero, Preloader, RoomUI, deepLinkToPlayer } from './ui/Screens.jsx';
import { AlbumDialog, FlatShelf, PhotoDialog } from './ui/Dialogs.jsx';
import { hotspotPortal } from './three/portal.js';

const Stage = lazy(() => import('./three/Stage.jsx'));

if (import.meta.env.DEV) window.__app = useApp;

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function useEnvironment() {
  useEffect(() => {
    const webgl = hasWebGL() && !new URLSearchParams(location.search).has('flat');
    const rm = matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = matchMedia('(pointer: coarse)');
    const sync = () => useApp.setState({ reducedMotion: rm.matches, coarsePointer: coarse.matches });
    useApp.setState({ webgl });
    sync();
    rm.addEventListener('change', sync);
    coarse.addEventListener('change', sync);
    loadPhotos().then((photos) => useApp.getState().setCollection(photos));
    return () => {
      rm.removeEventListener('change', sync);
      coarse.removeEventListener('change', sync);
    };
  }, []);

  // Without WebGL there is no walk in: doors open straight away.
  useEffect(
    () =>
      useApp.subscribe((s, prev) => {
        if (s.webgl) return;
        if (s.phase === 'entering' && prev.phase !== 'entering') useApp.setState({ phase: 'inside' });
        if (s.phase === 'leaving' && prev.phase !== 'leaving') useApp.setState({ phase: 'outside' });
      }),
    [],
  );

  // #player skips straight to the deck once the booth is ready
  useEffect(() => {
    if (location.hash !== '#player') return undefined;
    return useApp.subscribe((s, prev) => {
      if (s.phase === 'outside' && prev.phase === 'loading') deepLinkToPlayer();
    });
  }, []);

  // Escape in the room: put the tape back, then step back to the whole booth
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      const s = useApp.getState();
      if (s.phase !== 'inside' || s.station === 'watch' || s.albumOpen || s.lightboxId) return;
      if (s.heldTapeId) s.returnTape();
      else if (s.station !== 'booth') s.goStation('booth');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // keep the page's color scheme hint in step with the booth
  useEffect(() => {
    document.documentElement.dataset.ready = '';
  }, []);
}

export default function App() {
  useEnvironment();
  const webgl = useApp((s) => s.webgl);
  const phase = useApp((s) => s.phase);
  return (
    <div className="app" data-phase={phase}>
      <a className="skip-link" href="#main-action" onClick={(e) => { e.preventDefault(); document.querySelector('.cta, .plaque-key, .pb-skin')?.focus(); }}>
        Skip to the booth controls
      </a>
      {webgl && (
        <Suspense fallback={null}>
          <Stage />
        </Suspense>
      )}
      {!webgl && <div className="flat-backdrop" aria-hidden="true" />}
      <div className="hotspot-layer" ref={(el) => (hotspotPortal.current = el)} />
      <main id="main-action">
        <Hero />
        <FlatShelf />
        <RoomUI />
        <PlayerLayer />
      </main>
      <AlbumDialog />
      <PhotoDialog />
      <Announcer />
      <Preloader />
    </div>
  );
}
