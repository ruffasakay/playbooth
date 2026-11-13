import { useEffect, useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import { MOVIES } from '../data/movies.js';
import { useApp, movieById } from '../store.js';
import { SCREEN, SLOT, MACHINE, TAPE, TRAY, cubbyCenters } from './world.js';
import { restPose, useTrayPhotos } from './Prints.jsx';

import { hotspotPortal } from './portal.js';

/**
 * Every object you can touch in the room also gets a real <button> placed
 * over it. They are invisible until focused, so keyboard and screen reader
 * users can do everything a pointer can: pick up, insert, eject, watch,
 * open prints and the album.
 */
export function Hotspots() {
  const phase = useApp((s) => s.phase);
  const station = useApp((s) => s.station);
  const held = useApp((s) => s.heldTapeId);
  const inserted = useApp((s) => s.insertedTapeId);
  const inserting = useApp((s) => s.insertingId);
  const deck = useApp((s) => s.deck);
  const printing = useApp((s) => s.printing);
  const count = useApp((s) => s.collection.length);
  const trayPhotos = useTrayPhotos();
  const cubbies = useMemo(cubbyCenters, []);

  if (phase !== 'inside' || station === 'watch') return null;
  const heldMovie = movieById(held);
  const insertedMovie = movieById(inserted);

  return (
    <group>
      {MOVIES.slice(0, 9).map((m, i) => {
        if (m.id === inserted || m.id === inserting) return null;
        const c = cubbies[i];
        const isHeld = held === m.id;
        return (
          <Spot
            key={m.id}
            position={[c.x, c.floorY + TAPE.h / 2 + 0.02, c.z + 0.08]}
            label={isHeld ? `Put ${m.title} back on the shelf` : `Pick up the tape ${m.title}`}
            pressed={isHeld}
            onActivate={() => {
              const s = useApp.getState();
              if (isHeld) s.returnTape();
              else {
                s.pickTape(m.id);
                s.goStation('player');
              }
            }}
            onFocus={() => {
              const s = useApp.getState();
              s.setFocusedTape(m.id);
              if (!s.heldTapeId && (s.station === 'player' || s.station === 'prints')) s.goStation('tapes');
            }}
            onBlur={() => useApp.getState().setFocusedTape(null)}
          />
        );
      })}

      {heldMovie && (
        <Spot
          position={[SLOT.x, SLOT.y, SLOT.z + 0.05]}
          label={`Put ${heldMovie.title} into the player’s slot`}
          takeFocus
          tone="primary"
          onActivate={() => useApp.getState().requestInsert(heldMovie.id)}
        />
      )}

      {insertedMovie && !heldMovie && (
        <>
          <Spot
            position={[SCREEN.x, SCREEN.y, SCREEN.z + 0.02]}
            label={deck === 'reading' ? `Reading ${insertedMovie.title}` : `Sit down and watch ${insertedMovie.title}`}
            disabled={deck === 'reading'}
            tone="primary"
            takeFocus
            onActivate={() => useApp.getState().goStation('watch')}
          />
          <Spot
            position={[SLOT.x, SLOT.y, SLOT.z + 0.05]}
            label={`Eject ${insertedMovie.title}`}
            onActivate={() => useApp.getState().ejectTape()}
          />
        </>
      )}

      {!printing &&
        trayPhotos
          .slice()
          .reverse()
          .map((p, i) => {
            const stackIndex = trayPhotos.length - 1 - i;
            const pose = restPose(p, stackIndex);
            return (
              <Spot
                key={p.id}
                position={[pose.position.x, pose.position.y + 0.01, pose.position.z]}
                label={`Open print ${i + 1}: ${p.title}${p.timecode ? ` at ${p.timecode}` : ''}`}
                onActivate={() => useApp.getState().openLightbox(p.id)}
                onFocus={() => {
                  const s = useApp.getState();
                  if (s.station !== 'prints') s.goStation('prints');
                }}
              />
            );
          })}

      <Spot
        position={[TRAY.x + TRAY.w / 2, TRAY.y + 0.06, TRAY.z + TRAY.d / 2]}
        label={count ? `Open the photo album, ${count} saved` : 'Open the photo album, no photos yet'}
        onActivate={() => useApp.getState().setAlbumOpen(true)}
      />
      {/* keeps the machine reachable as a landmark for focus order */}
      <group position={[MACHINE.x, 0, MACHINE.z]} />
    </group>
  );
}

function Spot({ position, label, onActivate, onFocus, onBlur, takeFocus, disabled, pressed, tone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!takeFocus) return;
    // Keyboard users keep their place: if focus was on a hotspot, follow the flow here.
    const active = document.activeElement;
    if (active && (active.classList?.contains('hotspot') || active === document.body)) {
      if (active.classList?.contains('hotspot') || active === document.body) {
        const id = requestAnimationFrame(() => ref.current?.focus({ preventScroll: true }));
        return () => cancelAnimationFrame(id);
      }
    }
    return undefined;
  }, [takeFocus, label]);

  return (
    <Html position={position} center portal={hotspotPortal} zIndexRange={[20, 0]} wrapperClass="hotspot-anchor">
      <button
        ref={ref}
        type="button"
        className="hotspot"
        data-tone={tone}
        aria-label={label}
        aria-pressed={pressed === undefined ? undefined : pressed}
        aria-disabled={disabled || undefined}
        onClick={() => {
          if (!disabled) onActivate();
        }}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <span className="hotspot-label" aria-hidden="true">
          {label}
        </span>
      </button>
    </Html>
  );
}
