import { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import { useApp } from '../store.js';
import { BOOTH, FONT_HAND, FONT_MONO, FONT_SERIF, PAL, mat, motion } from './world.js';
import { canvasTexture } from './canvasTexture.js';
import { BORDERS, frameLayout, paintComposite } from '../data/borders.js';

const { halfW, halfD, wallH, wall, door } = BOOTH;

export function Booth() {
  return (
    <group>
      <Plinth />
      <Shell />
      <Roof />
      <SignBox />
      <Doorway />
      <Curtains />
      <DisplayCase />
      <CoinPlate />
      <Sconce />
    </group>
  );
}

function Plinth() {
  return (
    <mesh position={[0, -0.06, 0]} receiveShadow castShadow material={mat('#cfc6b8', { roughness: 0.9 })}>
      <boxGeometry args={[halfW * 2 + 0.24, 0.12, halfD * 2 + 0.24]} />
    </mesh>
  );
}

function Shell() {
  const body = mat(PAL.booth, { roughness: 0.6 });
  const sideW = halfW - door.halfW;
  const seam = mat('#cbc3b6', { roughness: 0.7 });
  const plaster = mat(PAL.plaster, { roughness: 0.92 });
  const wainscot = mat('#a77a52', { roughness: 0.7 });
  const rail = mat(PAL.woodDark);
  const innerX = halfW - wall;
  const innerZ = halfD - wall;
  const wainH = 0.92;
  return (
    <group>
      <RoundedBox args={[halfW * 2, wallH, wall]} radius={0.03} smoothness={2} position={[0, wallH / 2, -halfD + wall / 2]} castShadow receiveShadow material={body} />
      <RoundedBox args={[wall, wallH, halfD * 2]} radius={0.03} smoothness={2} position={[-halfW + wall / 2, wallH / 2, 0]} castShadow receiveShadow material={body} />
      <RoundedBox args={[wall, wallH, halfD * 2]} radius={0.03} smoothness={2} position={[halfW - wall / 2, wallH / 2, 0]} castShadow receiveShadow material={body} />
      <RoundedBox args={[sideW, wallH, wall]} radius={0.03} smoothness={2} position={[-door.halfW - sideW / 2, wallH / 2, halfD - wall / 2]} castShadow receiveShadow material={body} />
      <RoundedBox args={[sideW, wallH, wall]} radius={0.03} smoothness={2} position={[door.halfW + sideW / 2, wallH / 2, halfD - wall / 2]} castShadow receiveShadow material={body} />
      <RoundedBox args={[door.halfW * 2 + 0.02, wallH - door.h, wall]} radius={0.02} smoothness={2} position={[0, door.h + (wallH - door.h) / 2, halfD - wall / 2]} castShadow receiveShadow material={body} />

      {/* panel seams on the outside, like a prefabricated kiosk */}
      {[-1.7, -0.85, 0, 0.85, 1.7].map((z) => (
        <group key={z}>
          <mesh position={[-halfW - 0.001, wallH / 2, z]} rotation={[0, -Math.PI / 2, 0]} material={seam}>
            <planeGeometry args={[0.012, wallH - 0.1]} />
          </mesh>
          <mesh position={[halfW + 0.001, wallH / 2, z]} rotation={[0, Math.PI / 2, 0]} material={seam}>
            <planeGeometry args={[0.012, wallH - 0.1]} />
          </mesh>
        </group>
      ))}
      {/* kick plate */}
      <mesh position={[0, 0.09, halfD + 0.002]} material={mat('#b9b1a5', { roughness: 0.5, metalness: 0.2 })}>
        <boxGeometry args={[halfW * 2, 0.18, 0.01]} />
      </mesh>

      {/* inside: plaster above, wood wainscot below */}
      <mesh position={[0, (wallH + wainH) / 2, -innerZ + 0.006]} material={plaster}>
        <boxGeometry args={[innerX * 2, wallH - wainH, 0.01]} />
      </mesh>
      <mesh position={[0, wainH / 2, -innerZ + 0.008]} material={wainscot}>
        <boxGeometry args={[innerX * 2, wainH, 0.014]} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * (innerX - 0.006), (wallH + wainH) / 2, 0]} rotation={[0, side * -Math.PI / 2, 0]} material={plaster}>
            <boxGeometry args={[innerZ * 2, wallH - wainH, 0.01]} />
          </mesh>
          <mesh position={[side * (innerX - 0.008), wainH / 2, 0]} rotation={[0, side * -Math.PI / 2, 0]} material={wainscot}>
            <boxGeometry args={[innerZ * 2, wainH, 0.014]} />
          </mesh>
          <mesh position={[side * (door.halfW + (innerX - door.halfW) / 2), wallH / 2, innerZ - 0.006]} material={plaster}>
            <boxGeometry args={[innerX - door.halfW, wallH, 0.01]} />
          </mesh>
        </group>
      ))}
      {/* chair rail */}
      <mesh position={[0, wainH + 0.015, -innerZ + 0.025]} material={rail}>
        <boxGeometry args={[innerX * 2, 0.04, 0.04]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (innerX - 0.025), wainH + 0.015, 0]} material={rail}>
          <boxGeometry args={[0.04, 0.04, innerZ * 2]} />
        </mesh>
      ))}
      {/* vertical battens on the wainscot */}
      {Array.from({ length: 13 }, (_, i) => (
        <mesh key={i} position={[-innerX + 0.2 + i * ((innerX * 2 - 0.4) / 12), wainH / 2, -innerZ + 0.018]} material={mat('#8f6844')}>
          <boxGeometry args={[0.018, wainH - 0.04, 0.008]} />
        </mesh>
      ))}
    </group>
  );
}

function Roof() {
  return (
    <group position={[0, wallH, 0]}>
      <RoundedBox args={[halfW * 2 + 0.22, 0.16, halfD * 2 + 0.22]} radius={0.03} smoothness={2} position={[0, 0.08, 0]} castShadow receiveShadow material={mat(PAL.boothShade, { roughness: 0.7 })} />
      <mesh position={[0, -0.004, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#efe8dc', { roughness: 0.95 })}>
        <planeGeometry args={[halfW * 2 - wall * 2, halfD * 2 - wall * 2]} />
      </mesh>
    </group>
  );
}

function SignBox() {
  return (
    <group position={[0, 2.66, halfD + 0.06]}>
      <RoundedBox args={[2.6, 0.5, 0.12]} radius={0.04} smoothness={3} castShadow material={mat('#d9d1c4', { roughness: 0.5 })} />
      <mesh position={[0, 0, 0.062]}>
        <planeGeometry args={[2.46, 0.38]} />
        <meshStandardMaterial color="#f6efe2" emissive="#fff0d6" emissiveIntensity={0.35} roughness={0.4} />
      </mesh>
      <Text font={FONT_SERIF} fontSize={0.2} letterSpacing={0.18} color={PAL.ink} anchorX="center" anchorY="middle" position={[0, 0.035, 0.07]}>
        PLAYBOOTH
      </Text>
      <Text font={FONT_MONO} fontSize={0.055} letterSpacing={0.12} color={PAL.inkSoft} anchorX="center" anchorY="middle" position={[0, -0.12, 0.07]}>
        photos and films
      </Text>
    </group>
  );
}

function Doorway() {
  const trim = mat('#d2cabd', { roughness: 0.55 });
  const z = halfD - wall / 2;
  return (
    <group>
      <RoundedBox args={[0.08, door.h + 0.06, wall + 0.06]} radius={0.02} smoothness={2} position={[-door.halfW - 0.02, (door.h + 0.06) / 2, z]} castShadow material={trim} />
      <RoundedBox args={[0.08, door.h + 0.06, wall + 0.06]} radius={0.02} smoothness={2} position={[door.halfW + 0.02, (door.h + 0.06) / 2, z]} castShadow material={trim} />
      <RoundedBox args={[door.halfW * 2 + 0.12, 0.08, wall + 0.06]} radius={0.02} smoothness={2} position={[0, door.h + 0.02, z]} castShadow material={trim} />
    </group>
  );
}

function makeCurtainGeometry() {
  const g = new THREE.PlaneGeometry(door.halfW + 0.05, door.h - 0.08, 34, 8);
  g.userData.base = Float32Array.from(g.attributes.position.array);
  return g;
}

function Curtains() {
  const left = useMemo(makeCurtainGeometry, []);
  const right = useMemo(makeCurtainGeometry, []);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#8f3a2b',
        roughness: 0.9,
        sheen: 0.8,
        sheenRoughness: 0.5,
        sheenColor: new THREE.Color('#d98c74'),
        side: THREE.DoubleSide,
      }),
    [],
  );
  const reduced = useApp((s) => s.reducedMotion);
  const halfWidth = (door.halfW + 0.05) / 2;
  const height = door.h - 0.08;
  const last = useMemo(() => ({ open: -1 }), []);

  useFrame(({ clock }) => {
    const o = motion.curtain.open;
    if (reduced && Math.abs(o - last.open) < 0.0001) return;
    last.open = o;
    const t = clock.elapsedTime;
    for (const [geo, side] of [[left, -1], [right, 1]]) {
      const base = geo.userData.base;
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const bx = base[i * 3];
        const by = base[i * 3 + 1];
        const u = side < 0 ? (bx + halfWidth) / (halfWidth * 2) : (halfWidth - bx) / (halfWidth * 2);
        const v = (by + height / 2) / height;
        const gather = 1 - 0.86 * o * (0.6 + 0.4 * (1 - v));
        const jamb = side < 0 ? -halfWidth : halfWidth;
        const x = jamb + (bx - jamb) * gather;
        const sway = reduced ? 0 : Math.sin(t * 0.9 + u * 2.5) * 0.004 * (1 - o) * (1 - v);
        const amp = 0.018 + 0.045 * o;
        const z = Math.sin(u * Math.PI * 9) * amp + sway;
        pos.setXYZ(i, x, by, z);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }
  });

  return (
    <group position={[0, (door.h - 0.08) / 2 + 0.01, halfD - wall / 2 + 0.02]}>
      <mesh geometry={left} material={material} position={[-door.halfW + halfWidth - 0.02, 0, 0]} castShadow />
      <mesh geometry={right} material={material} position={[door.halfW - halfWidth + 0.02, 0, 0]} castShadow />
      <mesh position={[0, height / 2 + 0.02, 0.02]} rotation={[0, 0, Math.PI / 2]} material={mat('#8d877e', { metalness: 0.6, roughness: 0.35 })}>
        <cylinderGeometry args={[0.014, 0.014, door.halfW * 2 + 0.06, 10]} />
      </mesh>
    </group>
  );
}

/** Glass case on the side wall with sample photostrips, the way real booths advertise. */
function DisplayCase() {
  const strips = useMemo(
    () =>
      ['lace', 'stamp', 'polka'].map((id, k) =>
        canvasTexture(240, 720, (ctx, w, h) => {
          const border = BORDERS.find((b) => b.id === id);
          const bg = border.strip.wood ? '#4a3125' : border.strip.bg;
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, w, h);
          const scenes = [
            ['#d9b48a', '#8c6a52'],
            ['#b9c4c4', '#5d6f74'],
            ['#e3c49a', '#a0432f'],
          ];
          for (let i = 0; i < 3; i++) {
            const L = frameLayout(border, 4 / 3, w - 30);
            const c = document.createElement('canvas');
            c.width = L.W;
            c.height = L.H;
            paintComposite(c.getContext('2d'), border, L, { title: '', date: '' }, (g, win) => {
              const [sky, ground] = scenes[(i + k) % 3];
              const grad = g.createLinearGradient(0, win.y, 0, win.y + win.h);
              grad.addColorStop(0, sky);
              grad.addColorStop(1, ground);
              g.fillStyle = grad;
              g.fillRect(win.x, win.y, win.w, win.h);
              g.fillStyle = 'rgb(40 28 20 / 0.55)';
              g.beginPath();
              g.ellipse(win.x + win.w * (0.42 + i * 0.06), win.y + win.h * 0.78, win.w * 0.16, win.h * 0.42, 0, Math.PI, 0);
              g.fill();
              g.beginPath();
              g.arc(win.x + win.w * (0.42 + i * 0.06), win.y + win.h * 0.32, win.w * 0.085, 0, Math.PI * 2);
              g.fill();
            });
            ctx.drawImage(c, 15, 18 + i * ((h - 120) / 3), L.W, L.H);
          }
          ctx.fillStyle = border.strip.ink;
          ctx.font = '26px "Marcellus SC", serif';
          ctx.textAlign = 'center';
          ctx.fillText('PLAYBOOTH', w / 2, h - 40);
        }),
      ),
    [],
  );
  return (
    <group position={[-halfW - 0.01, 1.45, 0.55]} rotation={[0, -Math.PI / 2, 0]}>
      <RoundedBox args={[1.12, 1.3, 0.06]} radius={0.02} smoothness={2} position={[0, 0, -0.02]} castShadow material={mat('#cfc7ba', { roughness: 0.4, metalness: 0.15 })} />
      <mesh position={[0, 0, 0.012]} material={mat('#e9e2d6')}>
        <planeGeometry args={[1.02, 1.2]} />
      </mesh>
      {strips.map((tex, i) => (
        <mesh key={i} position={[-0.31 + i * 0.31, 0.02, 0.016]} rotation={[0, 0, (i - 1) * 0.03]}>
          <planeGeometry args={[0.25, 0.75]} />
          <meshStandardMaterial map={tex} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.02, 1.2]} />
        <meshPhysicalMaterial transparent opacity={0.12} roughness={0.05} metalness={0} color="#ffffff" />
      </mesh>
      <Text font={FONT_HAND} fontSize={0.075} color={PAL.ink} position={[0.26, -0.52, 0.035]} rotation={[0, 0, -0.04]}>
        prints while you wait
      </Text>
    </group>
  );
}

function CoinPlate() {
  return (
    <group position={[door.halfW + 0.48, 1.25, halfD + 0.004]}>
      <RoundedBox args={[0.32, 0.46, 0.02]} radius={0.015} smoothness={2} material={mat('#b4aea4', { metalness: 0.55, roughness: 0.35 })} />
      <mesh position={[0, 0.1, 0.012]} material={mat('#2a2622')}>
        <boxGeometry args={[0.02, 0.09, 0.005]} />
      </mesh>
      <Text font={FONT_MONO} fontSize={0.032} color={PAL.ink} position={[0, -0.07, 0.013]} anchorX="center">
        PHOTOS
      </Text>
      <Text font={FONT_MONO} fontSize={0.032} color={PAL.ink} position={[0, -0.12, 0.013]} anchorX="center">
        FILMS
      </Text>
    </group>
  );
}

function Sconce() {
  return (
    <group position={[-door.halfW - 0.4, 2.15, halfD + 0.08]}>
      <mesh position={[0, 0, -0.05]} material={mat('#8d877e', { metalness: 0.5, roughness: 0.4 })}>
        <boxGeometry args={[0.1, 0.16, 0.04]} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.07, 0.06, 0.18, 18]} />
        <meshStandardMaterial color="#fff3dc" emissive="#ffd9a3" emissiveIntensity={1.1} roughness={0.4} />
      </mesh>
    </group>
  );
}
