import { useEffect, useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import { MOVIES } from '../data/movies.js';
import { useApp, movieById } from '../store.js';
import { SCREEN, SLOT, TAPE, TRAY, cubbyCenters } from './world.js';
import { restPose, useTrayPhotos } from './Prints.jsx';
import { hotspotPortal } from './portal.js';
import { SWITCH_POS } from './Interior.jsx';

/**
 * Every object you can use in the room also has a real <button> over it,
 * invisible until focused, so the booth works from a keyboard or a screen reader.
 */
export function Hotspots() {
  const phase = useApp((s) => s.phase);
  const station = useApp((s) => s.station);
  const inspectId = useApp((s) => s.inspectId);
  const inserted = useApp((s) => s.insertedTapeId);
  const inserting = useApp((s) => s.insertingId);
  const deck = useApp((s) => s.deck);
  const printing = useApp((s) => s.printing);
  const count = useApp((s) => s.collection.length);
  const theme = useApp((s) => s.theme);
  const trayPhotos = useTrayPhotos();
  const cubbies = useMemo(cubbyCenters, []);

  if (phase !== 'inside' || station === 'watch' || inspectId) return null;
  const insertedMovie = movieById(inserted);

  return (
    <group>
      {MOVIES.slice(0, cubbies.length).map((m, i) => {
        if (m.id === inserted || m.id === inserting) return null;
        const c = cubbies[i];
        return (
          <Spot
            key={m.id}
            position={[c.x, c.floorY + TAPE.h / 2, c.z + 0.06]}
            label={`${m.title}, ${m.year}. Inspect`}
            onActivate={() => useApp.getState().openInspect(m.id)}
            onFocus={() => {
              const s = useApp.getState();
              s.setFocusedTape(m.id);
              if (s.station === 'player' || s.station === 'prints') s.goStation('tapes');
            }}
            onBlur={() => useApp.getState().setFocusedTape(null)}
          />
        );
      })}
      {insertedMovie && (
        <>
          <Spot
            position={[SCREEN.x, SCREEN.y, SCREEN.z + 0.02]}
            label={deck === 'reading' ? `Loading ${insertedMovie.title}` : `Sit and watch ${insertedMovie.title}`}
            disabled={deck === 'reading'}
            takeFocus
            onActivate={() => useApp.getState().goStation('watch')}
          />
          <Spot position={[SLOT.x, SLOT.y, SLOT.z + 0.04]} label={`Eject ${insertedMovie.title}`} onActivate={() => useApp.getState().ejectTape()} />
        </>
      )}
      {!printing &&
        trayPhotos
          .slice()
          .reverse()
          .map((p, i) => {
            const pose = restPose(p, trayPhotos.length - 1 - i);
            return (
              <Spot
                key={p.id}
                position={[pose.position.x, pose.position.y + 0.01, pose.position.z]}
                label={`${p.kind === 'strip' ? 'Photostrip' : 'Print'} ${i + 1}: ${p.title}`}
                onActivate={() => useApp.getState().openLightbox(p.id)}
                onFocus={() => {
                  const s = useApp.getState();
                  if (s.station !== 'prints') s.goStation('prints');
                }}
              />
            );
          })}
      <Spot position={SWITCH_POS} label={theme === 'night' ? 'Light switch: lights up' : 'Light switch: lights down'} onActivate={() => useApp.getState().toggleTheme()} />
      <Spot
        position={[TRAY.x + TRAY.w / 2, TRAY.y + 0.05, TRAY.z + TRAY.d / 2]}
        label={count ? `Photo album, ${count} saved` : 'Photo album, empty'}
        onActivate={() => useApp.getState().setAlbumOpen(true)}
      />
    </group>
  );
}

function Spot({ position, label, onActivate, onFocus, onBlur, takeFocus, disabled }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!takeFocus) return undefined;
    const active = document.activeElement;
    if (active?.classList?.contains('hotspot') || active === document.body) {
      const id = requestAnimationFrame(() => ref.current?.focus({ preventScroll: true }));
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [takeFocus, label]);
  return (
    <Html position={position} center portal={hotspotPortal} zIndexRange={[20, 0]} wrapperClass="hotspot-anchor">
      <button
        ref={ref}
        type="button"
        className="hotspot"
        aria-label={label}
        aria-disabled={disabled || undefined}
        onClick={() => !disabled && onActivate()}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <span className="hotspot-label" aria-hidden="true">{label}</span>
      </button>
    </Html>
  );
}
