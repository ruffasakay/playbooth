import { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox, Text } from '@react-three/drei';
import { FONT_SERIF, PAL, mat } from './world.js';
import { canvasTexture } from './canvasTexture.js';

const GROUND = -0.12;

export function Street() {
  return (
    <group>
      <Sidewalk />
      <Road />
      <Shopfront />
      <VendingMachine position={[-3.75, GROUND, -0.9]} />
      <UtilityPole position={[-6.2, GROUND, 4.3]} />
      <StreetLamp position={[6.4, GROUND, 4.2]} />
      <Bench position={[4.15, GROUND, 0.2]} rotation={[0, -Math.PI / 2, 0]} />
      <PottedPlant position={[3.4, GROUND, 2.75]} />
      <PottedPlant position={[-3.2, GROUND, 2.6]} scale={0.8} />
    </group>
  );
}

function Sidewalk() {
  const tex = useMemo(() => {
    const t = canvasTexture(512, 512, (ctx, w, h) => {
      const cols = 4;
      const rows = 8;
      const cw = w / cols;
      const ch = h / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = 170 + ((r * 7 + c * 13) % 5) * 5;
          ctx.fillStyle = `rgb(${v + 14} ${v + 4} ${v - 8})`;
          const off = r % 2 ? cw / 2 : 0;
          ctx.fillRect(((c * cw + off) % w), r * ch, cw, ch);
          if (off) ctx.fillRect(c * cw + off - w, r * ch, cw, ch);
        }
      }
      ctx.strokeStyle = 'rgba(80,66,55,0.45)';
      ctx.lineWidth = 3;
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * ch);
        ctx.lineTo(w, r * ch);
        ctx.stroke();
        const off = r % 2 ? cw / 2 : 0;
        for (let c = 0; c <= cols; c++) {
          ctx.beginPath();
          ctx.moveTo(c * cw + off, r * ch);
          ctx.lineTo(c * cw + off, (r + 1) * ch);
          ctx.stroke();
        }
      }
      // weathering
      for (let i = 0; i < 900; i++) {
        ctx.fillStyle = `rgba(60,45,35,${0.02 + (i % 7) * 0.006})`;
        ctx.fillRect((i * 73.1) % w, (i * 41.7) % h, 2 + (i % 3), 2 + (i % 2));
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(16, 6);
    return t;
  }, []);
  return (
    <group>
      <mesh position={[0, GROUND - 0.001, -0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[44, 11]} />
        <meshStandardMaterial map={tex} roughness={0.95} />
      </mesh>
      {/* curb */}
      <mesh position={[0, GROUND - 0.075, 5.05]} receiveShadow castShadow material={mat('#bdb3a6', { roughness: 0.9 })}>
        <boxGeometry args={[44, 0.17, 0.22]} />
      </mesh>
    </group>
  );
}

function Road() {
  const tex = useMemo(() => {
    const t = canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#6a625c';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 2600; i++) {
        const v = 80 + (i % 9) * 6;
        ctx.fillStyle = `rgba(${v},${v - 6},${v - 10},0.35)`;
        ctx.fillRect((i * 37.7) % w, (i * 53.3) % h, 1.5, 1.5);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(22, 6);
    return t;
  }, []);
  return (
    <group>
      <mesh position={[0, GROUND - 0.16, 11]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[44, 12]} />
        <meshStandardMaterial map={tex} roughness={0.96} />
      </mesh>
      {/* faded edge line */}
      <mesh position={[0, GROUND - 0.155, 5.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[44, 0.1]} />
        <meshStandardMaterial color="#e6dccb" roughness={1} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function Shopfront() {
  const z = -4.4;
  const tile = useMemo(() => {
    const t = canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#d8cfc0';
      ctx.fillRect(0, 0, w, h);
      const s = w / 8;
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const v = 206 + ((x * 5 + y * 3) % 4) * 4;
          ctx.fillStyle = `rgb(${v} ${v - 8} ${v - 22})`;
          ctx.fillRect(x * s + 1, y * s + 1, s - 2, s - 2);
        }
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(20, 1);
    return t;
  }, []);
  const windows = [-9, -5.2, 5.2, 9];
  return (
    <group>
      <mesh position={[0, 3, z - 0.2]} receiveShadow castShadow material={mat('#e3d7c4')}>
        <boxGeometry args={[30, 6.2, 0.4]} />
      </mesh>
      <mesh position={[0, 0.55, z + 0.005]} receiveShadow>
        <planeGeometry args={[30, 1.3]} />
        <meshStandardMaterial map={tile} roughness={0.7} />
      </mesh>
      {/* shop windows with warm light inside */}
      {windows.map((x) => (
        <group key={x} position={[x, 1.75, z + 0.02]}>
          <mesh material={mat(PAL.woodDark)}>
            <boxGeometry args={[2.7, 2.1, 0.08]} />
          </mesh>
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[2.5, 1.9]} />
            <meshStandardMaterial color="#f1c88f" emissive="#e9a95e" emissiveIntensity={0.42} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.05]} material={mat(PAL.woodDark)}>
            <boxGeometry args={[0.05, 1.9, 0.02]} />
          </mesh>
          <mesh position={[0, 1.45, 0.35]} rotation={[0.32, 0, 0]} castShadow material={mat(x < 0 ? PAL.tealDeep : '#7d5b46')}>
            <boxGeometry args={[2.9, 0.06, 0.8]} />
          </mesh>
        </group>
      ))}
      {/* upper floor windows */}
      {[-11, -7.5, -4, 4, 7.5, 11].map((x) => (
        <group key={x} position={[x, 4.4, z + 0.01]}>
          <mesh material={mat('#bfb2a0')}>
            <boxGeometry args={[1.3, 1.5, 0.06]} />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <planeGeometry args={[1.1, 1.3]} />
            <meshStandardMaterial color="#6f7478" roughness={0.2} metalness={0.1} />
          </mesh>
        </group>
      ))}
      <Text font={FONT_SERIF} fontSize={0.22} color={PAL.ink} position={[-7.1, 3.15, z + 0.03]} anchorX="center">
        BOOKS
      </Text>
      <Text font={FONT_SERIF} fontSize={0.22} color={PAL.ink} position={[7.1, 3.15, z + 0.03]} anchorX="center">
        COFFEE
      </Text>
    </group>
  );
}

function VendingMachine(props) {
  const cans = useMemo(() => {
    const colors = ['#a9483a', '#d8b26a', '#3f7d70', '#e7ddcc', '#5a6f8f', '#8e5a3a'];
    const out = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) out.push([c, r, colors[(c + r * 2) % colors.length]]);
    return out;
  }, []);
  return (
    <group {...props}>
      <RoundedBox args={[1.05, 1.86, 0.72]} radius={0.04} smoothness={3} position={[0, 0.93, 0]} castShadow receiveShadow material={mat('#e8e4dc', { roughness: 0.5 })} />
      <mesh position={[0, 1.27, 0.362]}>
        <planeGeometry args={[0.86, 0.9]} />
        <meshStandardMaterial color="#f7efe0" emissive="#fff1d8" emissiveIntensity={0.55} />
      </mesh>
      {cans.map(([c, r, color], i) => (
        <mesh key={i} position={[-0.33 + c * 0.13, 0.98 + r * 0.29, 0.37]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 14]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.52, 0.362]} material={mat('#2c2a28', { roughness: 0.4 })}>
        <planeGeometry args={[0.86, 0.3]} />
      </mesh>
      <mesh position={[0, 0.16, 0.37]} material={mat('#1f1d1b')}>
        <boxGeometry args={[0.6, 0.16, 0.02]} />
      </mesh>
    </group>
  );
}

function UtilityPole({ position }) {
  const wires = useMemo(() => {
    const top = new THREE.Vector3(...position).add(new THREE.Vector3(0, 7.6, 0));
    const ends = [new THREE.Vector3(18, 7.2, 3.5), new THREE.Vector3(18, 7.6, 5.2), new THREE.Vector3(-20, 7.5, 3.8)];
    return ends.map((end, i) => {
      const start = top.clone().add(new THREE.Vector3(i === 1 ? 0.6 : -0.6, 0.05, 0));
      const mid = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, -1.1, 0));
      return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(start, mid, end), 40, 0.012, 4, false);
    });
  }, [position]);
  return (
    <group>
      <group position={position}>
        <mesh position={[0, 4, 0]} castShadow material={mat('#a39a8f')}>
          <cylinderGeometry args={[0.12, 0.16, 8, 14]} />
        </mesh>
        <mesh position={[0, 7.6, 0]} castShadow material={mat('#5c534b')}>
          <boxGeometry args={[1.6, 0.1, 0.1]} />
        </mesh>
        <mesh position={[0.35, 6.4, 0.18]} castShadow material={mat('#8c857c')}>
          <cylinderGeometry args={[0.22, 0.22, 0.6, 14]} />
        </mesh>
      </group>
      {wires.map((g, i) => (
        <mesh key={i} geometry={g} material={mat('#2b2622')} />
      ))}
    </group>
  );
}

function StreetLamp({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.2, 0]} castShadow material={mat('#4a4744', { metalness: 0.3, roughness: 0.6 })}>
        <cylinderGeometry args={[0.05, 0.07, 4.4, 10]} />
      </mesh>
      <mesh position={[-0.35, 4.35, 0]} castShadow material={mat('#4a4744')}>
        <boxGeometry args={[0.8, 0.06, 0.08]} />
      </mesh>
      <mesh position={[-0.7, 4.24, 0]}>
        <cylinderGeometry args={[0.18, 0.12, 0.16, 16]} />
        <meshStandardMaterial color="#fff1d6" emissive="#ffd8a0" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

function Bench(props) {
  const wood = mat(PAL.wood);
  const iron = mat('#3b3633', { metalness: 0.4, roughness: 0.55 });
  return (
    <group {...props}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.46, -0.16 + i * 0.16]} castShadow receiveShadow material={wood}>
          <boxGeometry args={[1.7, 0.04, 0.13]} />
        </mesh>
      ))}
      {[0, 1].map((i) => (
        <mesh key={i} position={[0, 0.66 + i * 0.16, -0.26]} rotation={[-0.15, 0, 0]} castShadow material={wood}>
          <boxGeometry args={[1.7, 0.1, 0.035]} />
        </mesh>
      ))}
      {[-0.72, 0.72].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.23, 0.12]} material={iron}>
            <boxGeometry args={[0.05, 0.46, 0.05]} />
          </mesh>
          <mesh position={[0, 0.45, -0.25]} material={iron}>
            <boxGeometry args={[0.05, 0.9, 0.05]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function PottedPlant({ position, scale = 1, rotation }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * Math.PI * 2 + i * 0.4;
        const r = 0.06 + (i % 3) * 0.035;
        const h = 0.55 + ((i * 37) % 30) / 100;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, h, tilt: 0.12 + (i % 4) * 0.05, a };
      }),
    [],
  );
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow material={mat('#c9bfb0', { roughness: 0.7 })}>
        <cylinderGeometry args={[0.2, 0.16, 0.4, 24]} />
      </mesh>
      <mesh position={[0, 0.39, 0]} material={mat('#3d2d22')}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 20]} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh
          key={i}
          position={[l.x, 0.4 + l.h / 2, l.z]}
          rotation={[Math.sin(l.a) * l.tilt, l.a, Math.cos(l.a) * l.tilt]}
          castShadow
          material={mat(i % 2 ? PAL.leaf : PAL.leafLight)}
        >
          <boxGeometry args={[0.06, l.h, 0.012]} />
        </mesh>
      ))}
    </group>
  );
}
