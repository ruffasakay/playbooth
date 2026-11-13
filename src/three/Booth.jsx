import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import { useApp } from '../store.js';
import { BOOTH, FONT_URL, PAL, clay, motion } from './world.js';
import { canvasTexture } from './canvasTexture.js';

const { halfW, halfD, wallH, wall, door } = BOOTH;

export function Booth() {
  return (
    <group>
      <Platform />
      <Walls />
      <Roof />
      <MarqueeSign />
      <Doorway />
      <Curtains />
      <StripPoster />
      <SideWindow />
      <Plant position={[-1.25, 0, halfD + 0.42]} scale={1} />
      <Plant position={[1.3, 0, halfD + 0.42]} scale={0.82} leaf={PAL.mintDeep} />
      <WelcomeSign />
      <Lantern />
    </group>
  );
}

function Platform() {
  return (
    <group>
      <RoundedBox args={[halfW * 2 + 0.5, 0.36, halfD * 2 + 0.7]} radius={0.08} smoothness={3} position={[0, -0.18, 0.12]} receiveShadow castShadow material={clay(PAL.honey)} />
      {/* plank seams */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[-halfW - 0.25 + (i + 1) * ((halfW * 2 + 0.5) / 8), 0.002, halfD + 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.012, 0.5]} />
          <meshBasicMaterial color={PAL.walnut} transparent opacity={0.35} />
        </mesh>
      ))}
      <RoundedBox args={[1.9, 0.2, 0.55]} radius={0.06} smoothness={3} position={[0, -0.26, halfD + 0.72]} receiveShadow castShadow material={clay(PAL.honey)} />
      {/* stepping stones toward the hero camera */}
      {[
        [-0.25, 3.55, 0.42],
        [0.35, 4.25, 0.36],
        [-0.15, 4.95, 0.4],
        [0.45, 5.7, 0.33],
      ].map(([x, z, r], i) => (
        <mesh key={i} position={[x, -0.345, z]} receiveShadow>
          <cylinderGeometry args={[r, r * 1.04, 0.05, 28]} />
          <meshStandardMaterial color={PAL.cream} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Walls() {
  const body = clay(PAL.butter);
  const trim = clay(PAL.walnut);
  const sideW = halfW - door.halfW;
  const wain = clay(PAL.mint);
  const inner = halfD - wall; // inner face of the back wall
  const innerX = halfW - wall; // inner face of the side walls
  return (
    <group>
      {/* back and sides */}
      <RoundedBox args={[halfW * 2, wallH, wall]} radius={0.05} smoothness={2} position={[0, wallH / 2, -halfD + wall / 2]} castShadow receiveShadow material={body} />
      <RoundedBox args={[wall, wallH, halfD * 2]} radius={0.05} smoothness={2} position={[-halfW + wall / 2, wallH / 2, 0]} castShadow receiveShadow material={body} />
      <RoundedBox args={[wall, wallH, halfD * 2]} radius={0.05} smoothness={2} position={[halfW - wall / 2, wallH / 2, 0]} castShadow receiveShadow material={body} />
      {/* front wall around the doorway */}
      <RoundedBox args={[sideW, wallH, wall]} radius={0.05} smoothness={2} position={[-door.halfW - sideW / 2, wallH / 2, halfD - wall / 2]} castShadow receiveShadow material={body} />
      <RoundedBox args={[sideW, wallH, wall]} radius={0.05} smoothness={2} position={[door.halfW + sideW / 2, wallH / 2, halfD - wall / 2]} castShadow receiveShadow material={body} />
      <RoundedBox args={[door.halfW * 2 + 0.02, wallH - door.h, wall]} radius={0.04} smoothness={2} position={[0, door.h + (wallH - door.h) / 2, halfD - wall / 2]} castShadow receiveShadow material={body} />

      {/* corner posts */}
      {[
        [-halfW, -halfD],
        [halfW, -halfD],
        [-halfW, halfD],
        [halfW, halfD],
      ].map(([x, z], i) => (
        <RoundedBox key={i} args={[0.32, wallH + 0.12, 0.32]} radius={0.07} smoothness={3} position={[x, (wallH + 0.12) / 2 - 0.06, z]} castShadow material={trim} />
      ))}
      {/* base trim, outside */}
      <RoundedBox args={[halfW * 2, 0.22, 0.06]} radius={0.03} smoothness={2} position={[0, 0.11, halfD + 0.02]} material={trim} />
      <RoundedBox args={[0.06, 0.22, halfD * 2]} radius={0.03} smoothness={2} position={[-halfW - 0.02, 0.11, 0]} material={trim} />
      <RoundedBox args={[0.06, 0.22, halfD * 2]} radius={0.03} smoothness={2} position={[halfW + 0.02, 0.11, 0]} material={trim} />

      {/* inside: mint wainscot and a cream upper wall */}
      <mesh position={[0, 0.5, -inner + 0.011]} receiveShadow material={wain}>
        <boxGeometry args={[halfW * 2 - wall * 2, 1.0, 0.02]} />
      </mesh>
      <mesh position={[-innerX + 0.011, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} material={wain}>
        <boxGeometry args={[halfD * 2 - wall * 2, 1.0, 0.02]} />
      </mesh>
      <mesh position={[innerX - 0.011, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]} material={wain}>
        <boxGeometry args={[halfD * 2 - wall * 2, 1.0, 0.02]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (door.halfW + (halfW - wall - door.halfW) / 2), wallH / 2, inner - 0.008]} material={clay(PAL.cream)}>
          <boxGeometry args={[halfW - wall - door.halfW, wallH, 0.012]} />
        </mesh>
      ))}
      <mesh position={[0, 1.02, -inner + 0.03]} material={trim}>
        <boxGeometry args={[halfW * 2 - wall * 2, 0.05, 0.05]} />
      </mesh>
      <mesh position={[0, (wallH + 1.0) / 2, -inner + 0.008]} material={clay(PAL.cream)}>
        <boxGeometry args={[halfW * 2 - wall * 2, wallH - 1.0, 0.012]} />
      </mesh>
      <mesh position={[-innerX + 0.008, (wallH + 1.0) / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={clay(PAL.cream)}>
        <boxGeometry args={[halfD * 2 - wall * 2, wallH - 1.0, 0.012]} />
      </mesh>
      <mesh position={[innerX - 0.008, (wallH + 1.0) / 2, 0]} rotation={[0, -Math.PI / 2, 0]} material={clay(PAL.cream)}>
        <boxGeometry args={[halfD * 2 - wall * 2, wallH - 1.0, 0.012]} />
      </mesh>
    </group>
  );
}

function Roof() {
  const count = 15;
  const span = halfW * 2 + 0.5;
  const scallopR = span / count / 2;
  return (
    <group position={[0, wallH, 0]}>
      <RoundedBox args={[halfW * 2 + 0.5, 0.28, halfD * 2 + 0.5]} radius={0.1} smoothness={3} position={[0, 0.14, 0]} castShadow receiveShadow material={clay(PAL.cherry)} />
      <RoundedBox args={[halfW * 2 + 0.2, 0.12, halfD * 2 + 0.2]} radius={0.05} smoothness={2} position={[0, 0.33, 0]} castShadow material={clay(PAL.cherryDeep)} />
      {/* scalloped awning edge along the front */}
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          position={[-span / 2 + scallopR * (2 * i + 1), -0.01, halfD + 0.25]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
          material={clay(i % 2 ? PAL.paper : PAL.cherry)}
        >
          <cylinderGeometry args={[scallopR, scallopR, 0.05, 20, 1, false, Math.PI / 2, Math.PI]} />
        </mesh>
      ))}
    </group>
  );
}

const BULB_ON = new THREE.MeshStandardMaterial({ color: '#fff1c2', emissive: '#ffd27a', emissiveIntensity: 2.2, roughness: 0.4 });
const BULB_OFF = new THREE.MeshStandardMaterial({ color: '#f3d9a6', emissive: '#ffb84d', emissiveIntensity: 0.35, roughness: 0.4 });

function MarqueeSign() {
  const bulbs = useMemo(() => {
    const out = [];
    const w = 3.7;
    const h = 0.9;
    const step = 0.24;
    for (let x = -w / 2; x <= w / 2 + 0.001; x += step) {
      out.push([x, h / 2]);
      out.push([x, -h / 2]);
    }
    for (let y = -h / 2 + step; y < h / 2 - 0.05; y += step) {
      out.push([-w / 2, y]);
      out.push([w / 2, y]);
    }
    return out;
  }, []);
  const refs = useRef([]);
  const reduced = useApp((s) => s.reducedMotion);
  useFrame(({ clock }) => {
    const step = Math.floor(clock.elapsedTime * 5);
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.material = reduced || (i + step) % 3 !== 0 ? BULB_ON : BULB_OFF;
    });
  });
  return (
    <group position={[0, wallH + 0.95, halfD + 0.02]}>
      <RoundedBox args={[3.95, 1.12, 0.22]} radius={0.12} smoothness={3} castShadow material={clay(PAL.ink)} />
      <RoundedBox args={[3.55, 0.72, 0.06]} radius={0.06} smoothness={2} position={[0, 0, 0.1]} material={clay('#3a2f5c')} />
      <Text font={FONT_URL} fontSize={0.46} letterSpacing={0.02} color={PAL.butter} anchorX="center" anchorY="middle" position={[0, 0.02, 0.14]} outlineWidth={0.012} outlineColor={PAL.cherryDeep}>
        PLAYBOOTH
      </Text>
      {bulbs.map(([x, y], i) => (
        <mesh key={i} ref={(m) => (refs.current[i] = m)} position={[x, y, 0.13]} material={BULB_ON}>
          <sphereGeometry args={[0.045, 12, 10]} />
        </mesh>
      ))}
      {/* posts holding the sign */}
      {[-1.3, 1.3].map((x) => (
        <mesh key={x} position={[x, -0.62, -0.05]} material={clay(PAL.walnut)}>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 12]} />
        </mesh>
      ))}
    </group>
  );
}

function Doorway() {
  const trim = clay(PAL.walnut);
  const z = halfD + 0.02;
  return (
    <group>
      <RoundedBox args={[0.16, door.h + 0.12, 0.28]} radius={0.05} smoothness={2} position={[-door.halfW - 0.04, (door.h + 0.12) / 2, z - 0.1]} castShadow material={trim} />
      <RoundedBox args={[0.16, door.h + 0.12, 0.28]} radius={0.05} smoothness={2} position={[door.halfW + 0.04, (door.h + 0.12) / 2, z - 0.1]} castShadow material={trim} />
      <RoundedBox args={[door.halfW * 2 + 0.4, 0.2, 0.3]} radius={0.06} smoothness={2} position={[0, door.h + 0.08, z - 0.1]} castShadow material={trim} />
      {/* valance */}
      <RoundedBox args={[door.halfW * 2 + 0.06, 0.24, 0.12]} radius={0.06} smoothness={3} position={[0, door.h - 0.1, halfD - 0.02]} castShadow material={clay(PAL.cherryDeep)} />
      {/* threshold */}
      <RoundedBox args={[door.halfW * 2 + 0.2, 0.05, 0.4]} radius={0.02} smoothness={2} position={[0, 0.02, halfD - 0.08]} material={trim} />
    </group>
  );
}

function makeCurtainGeometry() {
  const g = new THREE.PlaneGeometry(door.halfW + 0.06, door.h - 0.12, 30, 6);
  g.userData.base = Float32Array.from(g.attributes.position.array);
  return g;
}

function Curtains() {
  const left = useMemo(makeCurtainGeometry, []);
  const right = useMemo(makeCurtainGeometry, []);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: PAL.cherry,
        roughness: 0.85,
        sheen: 1,
        sheenRoughness: 0.45,
        sheenColor: new THREE.Color('#ff9fb8'),
        side: THREE.DoubleSide,
      }),
    [],
  );
  const reduced = useApp((s) => s.reducedMotion);
  const halfWidth = (door.halfW + 0.06) / 2;
  const height = door.h - 0.12;

  useFrame(({ clock }) => {
    const o = motion.curtain.open;
    const t = clock.elapsedTime;
    for (const [geo, side] of [
      [left, -1],
      [right, 1],
    ]) {
      const base = geo.userData.base;
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const bx = base[i * 3];
        const by = base[i * 3 + 1];
        // 0 at the jamb, 1 at the middle of the doorway
        const u = side < 0 ? (bx + halfWidth) / (halfWidth * 2) : (halfWidth - bx) / (halfWidth * 2);
        const v = (by + height / 2) / height; // 0 bottom, 1 top
        const tie = 0.55 + 0.45 * (1 - v); // gather harder toward the bottom tie
        const gather = 1 - 0.84 * o * tie;
        const jamb = side < 0 ? -halfWidth : halfWidth;
        const x = jamb + (bx - jamb) * gather;
        const sway = reduced ? 0 : Math.sin(t * 1.3 + u * 3) * 0.006 * (1 - o) * (1 - v);
        const amp = 0.022 + 0.05 * o;
        const z = Math.sin(u * Math.PI * 7) * amp * (0.6 + 0.4 * (1 - v * 0.5)) + sway;
        pos.setXYZ(i, x, by, z);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }
  });

  return (
    <group position={[0, (door.h - 0.12) / 2 + 0.02, halfD - wall / 2 + 0.02]}>
      <mesh geometry={left} material={material} position={[-door.halfW + halfWidth - 0.03, 0, 0]} castShadow />
      <mesh geometry={right} material={material} position={[door.halfW - halfWidth + 0.03, 0, 0]} castShadow />
      {/* curtain rod */}
      <mesh position={[0, height / 2 + 0.02, 0.02]} rotation={[0, 0, Math.PI / 2]} material={clay(PAL.butterDeep, { metalness: 0.3, roughness: 0.4 })}>
        <cylinderGeometry args={[0.022, 0.022, door.halfW * 2 + 0.1, 12]} />
      </mesh>
    </group>
  );
}

function StripPoster() {
  const tex = useMemo(
    () =>
      canvasTexture(256, 768, (ctx, w, h) => {
        ctx.fillStyle = PAL.paper;
        ctx.fillRect(0, 0, w, h);
        const pad = 20;
        const fh = (h - pad * 2 - 90) / 4;
        const scenes = [
          [PAL.lilac, (x, y, fw, f) => { ctx.fillStyle = PAL.butter; ctx.beginPath(); ctx.arc(x + fw * 0.5, y + f * 0.55, f * 0.22, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = PAL.mint; ctx.fillRect(x, y + f * 0.68, fw, f * 0.32); }],
          [PAL.peach, (x, y, fw, f) => { ctx.fillStyle = PAL.cherry; ctx.beginPath(); const cx = x + fw / 2, cy = y + f * 0.55, s = f * 0.2; ctx.moveTo(cx, cy + s); ctx.bezierCurveTo(cx - s * 2, cy - s * 0.4, cx - s * 0.6, cy - s * 1.8, cx, cy - s * 0.6); ctx.bezierCurveTo(cx + s * 0.6, cy - s * 1.8, cx + s * 2, cy - s * 0.4, cx, cy + s); ctx.fill(); }],
          [PAL.mint, (x, y, fw, f) => { ctx.fillStyle = PAL.paper; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x + fw * (0.2 + i * 0.15), y + f * (0.3 + (i % 2) * 0.25), f * 0.05, 0, Math.PI * 2); ctx.fill(); } }],
          [PAL.ink, (x, y, fw, f) => { ctx.fillStyle = PAL.butter; ctx.beginPath(); ctx.arc(x + fw * 0.6, y + f * 0.45, f * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(x + fw * 0.68, y + f * 0.4, f * 0.18, 0, Math.PI * 2); ctx.fill(); }],
        ];
        scenes.forEach(([bg, draw], i) => {
          const y = pad + i * (fh + 8);
          ctx.fillStyle = bg;
          ctx.fillRect(pad, y, w - pad * 2, fh);
          draw(pad, y, w - pad * 2, fh);
        });
        ctx.fillStyle = PAL.cherry;
        ctx.font = '700 34px DynaPuff, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PLAYBOOTH', w / 2, h - 50);
      }),
    [],
  );
  return (
    <group position={[-halfW - 0.012, 1.55, 0.75]} rotation={[0, -Math.PI / 2, 0.035]}>
      <mesh castShadow position={[0, 0, -0.005]}>
        <boxGeometry args={[0.66, 1.86, 0.02]} />
        <meshStandardMaterial color={PAL.walnut} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.008]}>
        <planeGeometry args={[0.58, 1.74]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.9, 0.02]} material={clay(PAL.cherry)}>
        <sphereGeometry args={[0.04, 12, 10]} />
      </mesh>
    </group>
  );
}

function SideWindow() {
  return (
    <group>
      <group position={[halfW + 0.005, 1.8, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <RoundedBox args={[1.25, 0.95, 0.08]} radius={0.05} smoothness={2} material={clay(PAL.walnut)} />
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[1.05, 0.75]} />
          <meshStandardMaterial color="#ffe3a3" emissive="#ffc46b" emissiveIntensity={0.55} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.05]} material={clay(PAL.walnut)}>
          <boxGeometry args={[0.05, 0.75, 0.02]} />
        </mesh>
        <mesh position={[0, 0, 0.05]} material={clay(PAL.walnut)}>
          <boxGeometry args={[1.05, 0.05, 0.02]} />
        </mesh>
        <RoundedBox args={[1.35, 0.12, 0.22]} radius={0.04} smoothness={2} position={[0, -0.52, 0.08]} material={clay(PAL.walnut)} />
        {[-0.38, 0, 0.38].map((x, i) => (
          <mesh key={x} position={[x, -0.36, 0.12]}>
            <sphereGeometry args={[0.1 + (i % 2) * 0.03, 14, 12]} />
            <meshStandardMaterial color={i % 2 ? PAL.cherry : PAL.peach} roughness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Plant({ position, scale = 1, leaf = PAL.mint }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.2, 0]} castShadow material={clay(PAL.peach)}>
        <cylinderGeometry args={[0.2, 0.15, 0.4, 20]} />
      </mesh>
      <mesh position={[0, 0.41, 0]} material={clay('#6b4a33')}>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 20]} />
      </mesh>
      {[
        [0, 0.72, 0, 0.26],
        [-0.14, 0.6, 0.06, 0.2],
        [0.15, 0.62, -0.04, 0.21],
        [0.02, 0.92, 0.04, 0.17],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow material={clay(leaf)}>
          <sphereGeometry args={[r, 18, 14]} />
        </mesh>
      ))}
    </group>
  );
}

function WelcomeSign() {
  return (
    <group position={[1.95, 0, halfD + 0.75]} rotation={[0, -0.35, 0]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.42, s * 0.12]} rotation={[s * 0.22, 0, 0]} castShadow material={clay(PAL.walnut)}>
          <boxGeometry args={[0.62, 0.86, 0.04]} />
        </mesh>
      ))}
      <mesh position={[0, 0.45, 0.215]} rotation={[0.22, 0, 0]}>
        <planeGeometry args={[0.52, 0.7]} />
        <meshStandardMaterial color={PAL.ink} roughness={0.95} />
      </mesh>
      <Text font={FONT_URL} fontSize={0.1} color={PAL.butter} position={[0, 0.6, 0.235]} rotation={[0.22, 0, 0]} anchorX="center" anchorY="middle">
        Now
      </Text>
      <Text font={FONT_URL} fontSize={0.1} color={PAL.butter} position={[0, 0.47, 0.25]} rotation={[0.22, 0, 0]} anchorX="center" anchorY="middle">
        showing
      </Text>
      <Text font={FONT_URL} fontSize={0.07} color={PAL.paper} position={[0, 0.3, 0.29]} rotation={[0.22, 0, 0]} anchorX="center" anchorY="middle" maxWidth={0.46} textAlign="center">
        Step inside
      </Text>
    </group>
  );
}

function Lantern() {
  return (
    <group position={[-door.halfW - 0.42, 2.1, halfD + 0.09]}>
      <mesh material={clay(PAL.walnut)} position={[0, 0.18, -0.04]}>
        <boxGeometry args={[0.05, 0.1, 0.12]} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <sphereGeometry args={[0.11, 18, 14]} />
        <meshStandardMaterial color="#fff2c9" emissive="#ffcf70" emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[0, 0.12, 0.04]} material={clay(PAL.cherry)}>
        <cylinderGeometry args={[0.06, 0.12, 0.07, 16]} />
      </mesh>
    </group>
  );
}
