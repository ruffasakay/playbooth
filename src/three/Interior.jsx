import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useApp } from '../store.js';
import { BOOTH, PAL, clay } from './world.js';
import { canvasTexture } from './canvasTexture.js';
import { Cabinet } from './Cabinet.jsx';
import { Machine } from './Machine.jsx';
import { Tapes } from './Tape.jsx';
import { Prints } from './Prints.jsx';

const innerW = BOOTH.halfW * 2 - BOOTH.wall * 2;
const innerD = BOOTH.halfD * 2 - BOOTH.wall * 2;

export function Interior() {
  return (
    <group>
      <Floor />
      <Rug />
      <PendantLamp />
      <StringLights />
      <Posters />
      <Stool />
      <Cabinet />
      <Tapes />
      <Machine />
      <Prints />
    </group>
  );
}

function Floor() {
  const tex = useMemo(
    () =>
      canvasTexture(1024, 1024, (ctx, w, h) => {
        const planks = 9;
        const pw = w / planks;
        for (let i = 0; i < planks; i++) {
          ctx.fillStyle = i % 2 ? '#d89b5d' : '#cf9254';
          ctx.fillRect(i * pw, 0, pw, h);
          ctx.fillStyle = 'rgba(122,74,43,0.45)';
          ctx.fillRect(i * pw, 0, 3, h);
          const seam = ((i * 337) % 700) + 120;
          ctx.fillRect(i * pw, seam, pw, 3);
          // grain
          ctx.strokeStyle = 'rgba(122,74,43,0.12)';
          ctx.lineWidth = 2;
          for (let g = 0; g < 4; g++) {
            ctx.beginPath();
            const gx = i * pw + 14 + g * (pw / 4);
            ctx.moveTo(gx, 0);
            ctx.bezierCurveTo(gx + 6, h * 0.3, gx - 6, h * 0.6, gx + 4, h);
            ctx.stroke();
          }
        }
      }),
    [],
  );
  return (
    <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[innerW, innerD]} />
      <meshStandardMaterial map={tex} roughness={0.85} />
    </mesh>
  );
}

function Rug() {
  const tex = useMemo(
    () =>
      canvasTexture(512, 320, (ctx, w, h) => {
        ctx.fillStyle = PAL.lilac;
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, 160);
        ctx.fill();
        ctx.strokeStyle = PAL.paper;
        ctx.lineWidth = 10;
        ctx.setLineDash([22, 16]);
        ctx.beginPath();
        ctx.roundRect(24, 24, w - 48, h - 48, 130);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = PAL.periwinkle;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(w * (0.25 + i * 0.125), h / 2, 12, 0, Math.PI * 2);
          ctx.fill();
        }
      }),
    [],
  );
  return (
    <mesh position={[0.05, 0.012, 0.15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[2.6, 1.6]} />
      <meshStandardMaterial map={tex} transparent roughness={1} />
    </mesh>
  );
}

function PendantLamp() {
  return (
    <group position={[0.1, BOOTH.wallH, -0.2]}>
      <mesh position={[0, -0.3, 0]} material={clay(PAL.ink)}>
        <cylinderGeometry args={[0.008, 0.008, 0.6, 6]} />
      </mesh>
      <mesh position={[0, -0.66, 0]} material={clay(PAL.butter)}>
        <coneGeometry args={[0.26, 0.24, 28, 1, true]} />
      </mesh>
      <mesh position={[0, -0.74, 0]}>
        <sphereGeometry args={[0.07, 14, 12]} />
        <meshStandardMaterial color="#fff2c9" emissive="#ffd27a" emissiveIntensity={2.5} />
      </mesh>
      <pointLight position={[0, -0.8, 0]} intensity={9} distance={7} decay={1.6} color="#ffd9a0" />
    </group>
  );
}

function StringLights() {
  const bulbs = 13;
  const refs = useRef([]);
  const reduced = useApp((s) => s.reducedMotion);
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.emissiveIntensity = reduced ? 1.3 : 0.9 + Math.sin(clock.elapsedTime * 1.6 + i * 0.9) * 0.5;
    });
  });
  const z = -BOOTH.halfD + BOOTH.wall + 0.06;
  return (
    <group position={[0, 2.62, z]}>
      {Array.from({ length: bulbs }, (_, i) => {
        const t = i / (bulbs - 1);
        const x = -innerW / 2 + 0.2 + t * (innerW - 0.4);
        const y = -(Math.sin(t * Math.PI * 3) ** 2) * 0.12;
        const colors = [PAL.butter, PAL.peach, PAL.mint, '#ffd0de'];
        return (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[0.04, 10, 8]} />
            <meshStandardMaterial ref={(m) => (refs.current[i] = m)} color={colors[i % 4]} emissive={colors[i % 4]} emissiveIntensity={1.2} />
          </mesh>
        );
      })}
    </group>
  );
}

function Posters() {
  const a = useMemo(
    () =>
      canvasTexture(360, 512, (ctx, w, h) => {
        ctx.fillStyle = PAL.ink;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = PAL.butter;
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.42, w * 0.26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.ink;
        ctx.beginPath();
        ctx.arc(w * 0.6, h * 0.38, w * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.paper;
        for (let i = 0; i < 18; i++) {
          ctx.fillRect(((i * 97) % w), ((i * 151) % (h * 0.7)), 3, 3);
        }
        ctx.fillStyle = PAL.mint;
        ctx.fillRect(0, h * 0.72, w, h * 0.28);
        ctx.fillStyle = PAL.paper;
        ctx.font = '700 40px DynaPuff, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Late Show', w / 2, h * 0.87);
      }),
    [],
  );
  const b = useMemo(
    () =>
      canvasTexture(360, 512, (ctx, w, h) => {
        ctx.fillStyle = PAL.peach;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = PAL.cherry;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.ellipse(w / 2, h * 0.42, w * 0.08, w * 0.3, (i * Math.PI) / 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = PAL.butter;
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.42, w * 0.09, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.ink;
        ctx.font = '700 40px DynaPuff, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Bloom', w / 2, h * 0.87);
      }),
    [],
  );
  const z = -BOOTH.halfD + BOOTH.wall + 0.03;
  return (
    <group>
      {[
        [a, -0.15, 2.02, 0.03],
        [b, 0.42, 1.95, -0.04],
      ].map(([tex, x, y, rot], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, 0, rot]}>
          <RoundedBox args={[0.42, 0.58, 0.03]} radius={0.01} smoothness={2} material={clay(PAL.walnut)} />
          <mesh position={[0, 0, 0.017]}>
            <planeGeometry args={[0.36, 0.51]} />
            <meshStandardMaterial map={tex} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Stool() {
  return (
    <group position={[-0.05, 0, -0.2]}>
      <mesh position={[0, 0.46, 0]} castShadow material={clay(PAL.cherry)}>
        <cylinderGeometry args={[0.22, 0.22, 0.09, 28]} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.4;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.13, 0.21, Math.sin(a) * 0.13]} rotation={[Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12]} material={clay(PAL.walnut)}>
            <cylinderGeometry args={[0.025, 0.03, 0.44, 8]} />
          </mesh>
        );
      })}
    </group>
  );
}
