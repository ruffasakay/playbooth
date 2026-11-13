import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import { useApp, movieById } from '../store.js';
import {
  FONT_URL,
  MACHINE,
  MONO_URL,
  PAL,
  PRINTER,
  SCREEN,
  SLOT,
  TRAY,
  clay,
  damp,
} from './world.js';
import { ScreenPainter } from './screenPainter.js';

const { x, z, w, h, d, base, front } = MACHINE;

export function Machine() {
  return (
    <group>
      <Body />
      <Screen />
      <Deck />
      <Slot />
      <Reels />
      <Printer />
      <Tray />
    </group>
  );
}

function Body() {
  return (
    <group>
      <RoundedBox args={[w + 0.08, base, d + 0.08]} radius={0.05} smoothness={2} position={[x, base / 2, z]} castShadow receiveShadow material={clay(PAL.walnut)} />
      <RoundedBox args={[w, h, d]} radius={0.12} smoothness={4} position={[x, base + h / 2, z]} castShadow receiveShadow material={clay(PAL.mint)} />
      {/* cream face behind the screen */}
      <RoundedBox args={[w - 0.12, 0.98, 0.05]} radius={0.06} smoothness={3} position={[x, SCREEN.y, front + 0.015]} material={clay(PAL.cream)} />
      {/* speaker grille on the left flank */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[x - w / 2 - 0.004, 1.1 + i * 0.07, z + 0.1]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.42, 0.022]} />
          <meshStandardMaterial color={PAL.mintDeep} roughness={0.9} />
        </mesh>
      ))}
      {/* badge */}
      <Text font={FONT_URL} fontSize={0.05} color={PAL.ink} anchorX="left" anchorY="middle" position={[x - w / 2 + 0.1, SCREEN.y + 0.43, front + 0.045]}>
        PLAYBOOTH deck
      </Text>
    </group>
  );
}

function Screen() {
  const painter = useMemo(() => new ScreenPainter(1024, 576), []);
  const last = useRef(0);
  useEffect(() => () => painter.texture.dispose(), [painter]);

  useFrame(({ clock }) => {
    const s = useApp.getState();
    if (s.phase === 'inside' && s.station === 'watch') return; // the deck covers the room
    const t = clock.elapsedTime;
    const playing = s.videoEl && !s.videoEl.paused;
    const interval = playing ? 1 / 30 : 1 / 15;
    if (t - last.current < interval) return;
    last.current = t;
    const movie = movieById(s.insertedTapeId);
    if (!movie) painter.paintIdle(s.reducedMotion ? 0 : t, !!s.heldTapeId || s.dragging);
    else if (s.deck === 'reading') painter.paintReading(s.reducedMotion ? 0 : t, movie);
    else painter.paintShow({ video: s.videoEl, borderId: s.borderId, aspect: s.videoAspect, movie });
    painter.texture.needsUpdate = true;
  });

  const onClick = (e) => {
    const s = useApp.getState();
    if (s.phase !== 'inside' || s.station === 'watch' || !s.insertedTapeId || s.deck === 'reading') return;
    e.stopPropagation();
    s.goStation('watch');
  };
  const onOver = (e) => {
    const s = useApp.getState();
    if (s.insertedTapeId && s.station !== 'watch') {
      e.stopPropagation();
      document.body.style.cursor = 'pointer';
    }
  };

  return (
    <group>
      <RoundedBox args={[SCREEN.w + 0.1, SCREEN.h + 0.1, 0.04]} radius={0.04} smoothness={3} position={[SCREEN.x, SCREEN.y, front + 0.032]} material={clay(PAL.ink)} />
      <mesh position={[SCREEN.x, SCREEN.y, SCREEN.z]} onClick={onClick} onPointerOver={onOver} onPointerOut={() => (document.body.style.cursor = '')}>
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        <meshBasicMaterial map={painter.texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Deck() {
  const play = useRef();
  const led = useRef();
  useFrame((state, dt) => {
    const s = useApp.getState();
    const playing = s.videoEl && !s.videoEl.paused && s.insertedTapeId;
    if (led.current) {
      led.current.emissiveIntensity = damp(
        led.current.emissiveIntensity,
        playing ? 1.4 + (s.reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 4) * 0.4) : 0.3,
        6,
        dt,
      );
    }
    if (play.current) play.current.position.y = damp(play.current.position.y, playing ? 0.012 : 0.03, 10, dt);
  });
  return (
    <group position={[x, 0.98, front + 0.07]} rotation={[-0.4, 0, 0]}>
      <RoundedBox args={[w - 0.1, 0.3, 0.14]} radius={0.05} smoothness={3} castShadow material={clay(PAL.butter)} />
      <group position={[0, 0.07, 0]}>
        {/* big play key */}
        <mesh ref={play} position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} material={clay(PAL.cherry)} castShadow>
          <cylinderGeometry args={[0.075, 0.075, 0.06, 28]} />
        </mesh>
        {[-0.16, 0.16].map((px) => (
          <RoundedBox key={px} args={[0.1, 0.045, 0.08]} radius={0.018} smoothness={2} position={[px, 0.02, 0]} material={clay(PAL.paper)} />
        ))}
        {/* LCD */}
        <mesh position={[-0.47, 0.02, 0.0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.24, 0.02, 0.09]} />
          <meshStandardMaterial ref={led} color="#9fe3c9" emissive="#5fe0b0" emissiveIntensity={0.3} />
        </mesh>
        {/* fader */}
        <mesh position={[0.46, 0.012, 0]}>
          <boxGeometry args={[0.24, 0.01, 0.018]} />
          <meshStandardMaterial color={PAL.ink} />
        </mesh>
        <RoundedBox args={[0.05, 0.05, 0.06]} radius={0.015} smoothness={2} position={[0.5, 0.03, 0]} material={clay(PAL.ink)} />
      </group>
    </group>
  );
}

function Slot() {
  const glow = useRef();
  const holder = useRef();
  useFrame(({ clock }, dt) => {
    const s = useApp.getState();
    const holding = !!s.heldTapeId || s.dragging;
    let target = 0.35;
    if (holding) target = 1 + s.attraction * 3 + (s.reducedMotion ? 0 : Math.sin(clock.elapsedTime * 5) * 0.4 * (1 - s.attraction));
    if (s.insertingId) target = 3.5;
    if (glow.current) glow.current.emissiveIntensity = damp(glow.current.emissiveIntensity, target, 10, dt);
    if (holder.current) holder.current.scale.x = damp(holder.current.scale.x, holding ? 1.06 : 1, 8, dt);
  });
  const onClick = (e) => {
    const s = useApp.getState();
    if (s.phase !== 'inside' || s.station === 'watch') return;
    if (s.heldTapeId) {
      e.stopPropagation();
      s.requestInsert(s.heldTapeId);
    }
  };
  return (
    <group position={[SLOT.x, SLOT.y, front]}>
      <group ref={holder}>
        <RoundedBox args={[0.62, 0.17, 0.04]} radius={0.04} smoothness={3} position={[0, 0, 0.012]} material={clay(PAL.mintDeep)} />
        <RoundedBox args={[0.5, 0.075, 0.03]} radius={0.02} smoothness={2} position={[0, 0, 0.03]} material={clay(PAL.glass)} />
        <mesh position={[0, 0.062, 0.035]}>
          <planeGeometry args={[0.5, 0.016]} />
          <meshStandardMaterial ref={glow} color="#d9fff2" emissive="#7dffd2" emissiveIntensity={0.35} toneMapped={false} />
        </mesh>
      </group>
      <Text font={MONO_URL} fontSize={0.034} color={PAL.ink} anchorX="center" anchorY="middle" position={[0, -0.12, 0.016]}>
        TAPE IN
      </Text>
      {/* forgiving click target */}
      <mesh
        position={[0, 0, 0.12]}
        onClick={onClick}
        onPointerOver={(e) => {
          if (useApp.getState().heldTapeId) {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <boxGeometry args={[0.9, 0.42, 0.26]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
  );
}

function Reels() {
  const left = useRef();
  const right = useRef();
  useFrame((_, dt) => {
    const s = useApp.getState();
    const spin = s.videoEl && !s.videoEl.paused && s.insertedTapeId && !s.reducedMotion ? 2.4 : 0;
    if (s.deck === 'reading' && !s.reducedMotion) {
      left.current.rotation.z -= dt * 6;
      right.current.rotation.z -= dt * 6;
    }
    left.current.rotation.z -= dt * spin;
    right.current.rotation.z -= dt * spin * 1.3;
  });
  const top = base + h;
  const reel = (ref, px, r, color) => (
    <group position={[x + px, top + r + 0.04, z - 0.05]}>
      <group ref={ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow material={clay(color)}>
          <cylinderGeometry args={[r, r, 0.05, 36]} />
        </mesh>
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, 0.027]}>
              <circleGeometry args={[r * 0.2, 16]} />
              <meshStandardMaterial color={PAL.mintDeep} />
            </mesh>
          );
        })}
        <mesh position={[0, 0, 0.028]}>
          <circleGeometry args={[r * 0.12, 16]} />
          <meshStandardMaterial color={PAL.ink} />
        </mesh>
      </group>
      <mesh position={[0, -r / 2 - 0.02, -0.035]} material={clay(PAL.walnut)}>
        <boxGeometry args={[0.05, r + 0.04, 0.03]} />
      </mesh>
    </group>
  );
  return (
    <group>
      {reel(left, -0.36, 0.22, PAL.paper)}
      {reel(right, 0.3, 0.17, PAL.butter)}
    </group>
  );
}

function Printer() {
  const count = useApp((s) => s.collection.length);
  const lamp = useRef();
  useFrame(({ clock }, dt) => {
    const s = useApp.getState();
    if (!lamp.current) return;
    const target = s.printing ? 1.8 + (s.reducedMotion ? 0 : Math.sin(clock.elapsedTime * 8) * 0.8) : 0.4;
    lamp.current.emissiveIntensity = damp(lamp.current.emissiveIntensity, target, 10, dt);
  });
  return (
    <group>
      <RoundedBox args={[PRINTER.w + 0.06, PRINTER.base, PRINTER.d + 0.06]} radius={0.04} smoothness={2} position={[PRINTER.x, PRINTER.base / 2, PRINTER.z]} material={clay(PAL.walnut)} castShadow />
      <RoundedBox args={[PRINTER.w, PRINTER.h, PRINTER.d]} radius={0.1} smoothness={4} position={[PRINTER.x, PRINTER.y, PRINTER.z]} castShadow receiveShadow material={clay(PAL.butter)} />
      {/* output slot */}
      <RoundedBox args={[0.5, 0.06, 0.03]} radius={0.02} smoothness={2} position={[PRINTER.x, PRINTER.slotY, PRINTER.front + 0.005]} material={clay(PAL.glass)} />
      <Text font={FONT_URL} fontSize={0.06} color={PAL.ink} anchorX="center" anchorY="middle" position={[PRINTER.x, PRINTER.slotY + 0.11, PRINTER.front + 0.004]}>
        Prints
      </Text>
      {/* status lamp and counter */}
      <mesh position={[PRINTER.x - 0.2, PRINTER.slotY - 0.13, PRINTER.front + 0.004]}>
        <circleGeometry args={[0.025, 16]} />
        <meshStandardMaterial ref={lamp} color={PAL.cherry} emissive={PAL.cherry} emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
      <mesh position={[PRINTER.x + 0.06, PRINTER.slotY - 0.13, PRINTER.front + 0.003]}>
        <planeGeometry args={[0.3, 0.07]} />
        <meshStandardMaterial color="#20302b" />
      </mesh>
      <Text font={MONO_URL} fontSize={0.038} color="#9ff5d4" anchorX="center" anchorY="middle" position={[PRINTER.x + 0.06, PRINTER.slotY - 0.13, PRINTER.front + 0.006]}>
        {`${String(Math.min(count, 999)).padStart(3, '0')} saved`}
      </Text>
    </group>
  );
}

function Tray() {
  const setAlbumOpen = useApp((s) => s.setAlbumOpen);
  return (
    <group position={[TRAY.x, TRAY.y, TRAY.z]}>
      <RoundedBox args={[TRAY.w, 0.04, TRAY.d]} radius={0.015} smoothness={2} position={[0, -0.02, 0]} material={clay(PAL.honey)} receiveShadow castShadow />
      {[
        [0, 0.035, TRAY.d / 2, TRAY.w, 0.11, 0.03],
        [0, 0.035, -TRAY.d / 2, TRAY.w, 0.11, 0.03],
        [TRAY.w / 2, 0.035, 0, 0.03, 0.11, TRAY.d],
        [-TRAY.w / 2, 0.035, 0, 0.03, 0.11, TRAY.d],
      ].map(([px, py, pz, sx, sy, sz], i) => (
        <mesh key={i} position={[px, py, pz]} material={clay(PAL.walnut)} castShadow>
          <boxGeometry args={[sx, sy, sz]} />
        </mesh>
      ))}
      {/* legs */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (TRAY.w / 2 - 0.05), -TRAY.y / 2 - 0.02, sz * (TRAY.d / 2 - 0.05)]} material={clay(PAL.walnut)}>
          <cylinderGeometry args={[0.02, 0.02, TRAY.y - 0.04, 8]} />
        </mesh>
      ))}
      {/* the tray itself opens the album */}
      <mesh
        position={[0, -0.006, 0]}
        onClick={(e) => {
          const s = useApp.getState();
          if (s.phase !== 'inside' || s.station === 'watch') return;
          e.stopPropagation();
          setAlbumOpen(true);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <boxGeometry args={[TRAY.w, 0.02, TRAY.d]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
  );
}

export const TRAY_TOP = new THREE.Vector3(TRAY.x, TRAY.y, TRAY.z);
