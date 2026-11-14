import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox, Text } from '@react-three/drei';
import { FONT_SERIF, PAL, dayNight, mat } from './world.js';
import { canvasTexture } from './canvasTexture.js';

const G = -0.12;

/**
 * The street, composed for a camera at the booth's front right so the
 * booth's face turns toward the page's text. The shops close the sky, and
 * a few lived-in things (a bicycle, a chalk sign, a post box) give scale.
 */
export function Street() {
  return (
    <group>
      <Sidewalk />
      <Road />
      <Shopfront />
      <BackBlocks />
      <Festoon />
      <VendingMachine position={[-4.1, G, -1.2]} />
      <UtilityPole position={[-7.6, G, -3.3]} />
      <StreetLamp position={[-5.4, G, 4.4]} withLight />
      <Bench position={[4.3, G, -0.6]} rotation={[0, -Math.PI / 2, 0]} />
      <Bicycle position={[-1.75, G, 2.44]} />
      <PostBox position={[3.25, G, 3.05]} />
      <PlantCrate position={[1.45, G, 2.62]} />
      <PottedPlant position={[2.55, G, 2.7]} scale={1.05} />
      <PottedPlant position={[-3.1, G, 2.75]} scale={0.8} />
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
        for (let c = 0; c <= cols; c++) {
          const v = 176 + ((r * 7 + c * 13) % 5) * 5;
          ctx.fillStyle = `rgb(${v + 12} ${v + 2} ${v - 12})`;
          const off = r % 2 ? cw / 2 : 0;
          ctx.fillRect(c * cw + off - (off ? cw : 0), r * ch, cw, ch);
        }
      }
      ctx.strokeStyle = 'rgba(80,66,55,0.42)';
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
      <mesh position={[0, G - 0.001, -0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[44, 11]} />
        <meshStandardMaterial map={tex} roughness={0.95} />
      </mesh>
      <mesh position={[0, G - 0.075, 5.05]} receiveShadow castShadow material={mat('#bdb3a6', { roughness: 0.9 })}>
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
      <mesh position={[0, G - 0.16, 11]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[44, 12]} />
        <meshStandardMaterial map={tex} roughness={0.96} />
      </mesh>
      <mesh position={[0, G - 0.155, 5.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[44, 0.1]} />
        <meshStandardMaterial color="#e6dccb" roughness={1} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function ShopWindow({ x, z, awning }) {
  return (
    <group position={[x, 1.75, z + 0.02]}>
      <mesh material={mat(PAL.woodDark)}>
        <boxGeometry args={[2.7, 2.1, 0.08]} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[2.5, 1.9]} />
        <meshStandardMaterial color="#f1c88f" emissive="#e9a95e" emissiveIntensity={0.42} roughness={0.25} ref={dayNight('emissiveIntensity', 0.42, 1.35)} />
      </mesh>
      <mesh position={[0, 0, 0.05]} material={mat(PAL.woodDark)}>
        <boxGeometry args={[0.05, 1.9, 0.02]} />
      </mesh>
      <mesh position={[0, 1.42, 0.38]} rotation={[0.34, 0, 0]} castShadow material={mat(awning)}>
        <boxGeometry args={[2.9, 0.05, 0.85]} />
      </mesh>
    </group>
  );
}

function Shopfront() {
  const z = -4.4;
  const tile = useMemo(() => {
    const t = canvasTexture(256, 256, (ctx, w) => {
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
  return (
    <group>
      <mesh position={[0, 3, z - 0.2]} receiveShadow castShadow material={mat('#a9b5ae')}>
        <boxGeometry args={[30, 6.2, 0.4]} />
      </mesh>
      <mesh position={[0, 0.55, z + 0.005]} receiveShadow>
        <planeGeometry args={[30, 1.3]} />
        <meshStandardMaterial map={tile} roughness={0.7} />
      </mesh>
      <ShopWindow x={-8.6} z={z} awning={PAL.tealDeep} />
      <ShopWindow x={-4.9} z={z} awning="#7d5b46" />
      <ShopWindow x={4.9} z={z} awning={PAL.terracottaDeep} />
      <ShopWindow x={8.6} z={z} awning={PAL.tealDeep} />
      {[-11, -7.5, -4, 0, 4, 7.5, 11].map((x, i) => (
        <group key={x} position={[x, 4.4, z + 0.01]}>
          <mesh material={mat('#efe6d6')}>
            <boxGeometry args={[1.3, 1.5, 0.06]} />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <planeGeometry args={[1.1, 1.3]} />
            <meshStandardMaterial color="#6f7478" emissive="#ffc782" emissiveIntensity={0} roughness={0.2} ref={dayNight('emissiveIntensity', 0, i % 3 === 1 ? 0 : 0.9)} />
          </mesh>
          <mesh position={[0, -0.82, 0.12]} material={mat('#8d877e')}>
            <boxGeometry args={[1.4, 0.05, 0.24]} />
          </mesh>
        </group>
      ))}
      <Text font={FONT_SERIF} fontSize={0.24} color={PAL.ink} position={[-6.75, 3.2, z + 0.03]} anchorX="center">
        Books
      </Text>
      <Text font={FONT_SERIF} fontSize={0.24} color={PAL.ink} position={[6.75, 3.2, z + 0.03]} anchorX="center">
        Coffee
      </Text>
    </group>
  );
}

/** Taller buildings behind and to the sides, so the sky never reads as empty. */
function BackBlocks() {
  const blocks = [
    [-9, 4.6, -8.5, 7, 9.2, '#8e9ca4'],
    [-1.5, 5.4, -9.5, 8, 10.8, '#7d8b93'],
    [7, 4.2, -8.8, 7, 8.4, '#98a58e'],
    [-15, 3.6, -1, 5, 7.2, '#a9a19a'],
    [15, 3.9, -1, 5, 7.8, '#8e9ca4'],
  ];
  return (
    <group>
      {blocks.map(([x, y, z, w, h, c], i) => (
        <group key={i}>
          <mesh position={[x, y, z]} castShadow receiveShadow material={mat(c)}>
            <boxGeometry args={[w, h, 4]} />
          </mesh>
          {Array.from({ length: 3 }, (_, r) =>
            Array.from({ length: Math.floor(w / 1.6) }, (_, k) => (
              <mesh key={`${r}-${k}`} position={[x - w / 2 + 1 + k * 1.6, y + h / 2 - 1.3 - r * 1.8, z + 2.01]}>
                <planeGeometry args={[0.8, 1]} />
                <meshStandardMaterial color="#8a8f92" emissive="#ffc782" emissiveIntensity={0} roughness={0.3} ref={dayNight('emissiveIntensity', 0, (k + r + i) % 3 ? 0.7 : 0)} />
              </mesh>
            )),
          )}
        </group>
      ))}
    </group>
  );
}

/** A loose string of bulbs along the shopfront. */
function Festoon() {
  const spans = [[-12, -2.8], [2.8, 12]];
  const bulbs = useMemo(() => {
    const out = [];
    for (const [a, b] of spans) {
      for (let i = 0; i <= 16; i++) {
        const t = i / 16;
        out.push([a + (b - a) * t, 3.75 - Math.sin(t * Math.PI) * 0.5, -4.05]);
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const wire = useMemo(
    () =>
      spans.map(([a, b]) => {
        const pts = Array.from({ length: 24 }, (_, i) => {
          const t = i / 23;
          return new THREE.Vector3(a + (b - a) * t, 3.82 - Math.sin(t * Math.PI) * 0.5, -4.05);
        });
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.008, 4, false);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const bulb = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fff1d0', emissive: '#ffcf86', emissiveIntensity: 0.5 }), []);
  useEffect(() => {
    const register = dayNight('emissiveIntensity', 0.5, 2.6);
    register(bulb);
    return () => register(null);
  }, [bulb]);
  return (
    <group>
      {wire.map((g, i) => (
        <mesh key={i} geometry={g} material={mat('#2b2622')} />
      ))}
      {bulbs.map((p, i) => (
        <mesh key={i} position={p} material={bulb}>
          <sphereGeometry args={[0.05, 10, 8]} />
        </mesh>
      ))}
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
        <meshStandardMaterial color="#f7efe0" emissive="#fff1d8" emissiveIntensity={0.5} ref={dayNight('emissiveIntensity', 0.5, 1.6)} />
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
      <mesh position={[0, 1.79, 0.362]} material={mat(PAL.tealDeep)}>
        <planeGeometry args={[1.0, 0.1]} />
      </mesh>
    </group>
  );
}

function UtilityPole({ position }) {
  const wires = useMemo(() => {
    const top = new THREE.Vector3(...position).add(new THREE.Vector3(0, 7.6, 0));
    const ends = [new THREE.Vector3(20, 7.0, -1.5), new THREE.Vector3(20, 7.5, 0.2), new THREE.Vector3(-22, 7.4, -3)];
    return ends.map((end, i) => {
      const start = top.clone().add(new THREE.Vector3(i === 1 ? 0.6 : -0.6, 0.05, 0));
      const mid = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, -1.2, 0));
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

function StreetLamp({ position, withLight }) {
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
        <meshStandardMaterial color="#fff1d6" emissive="#ffd8a0" emissiveIntensity={0.25} ref={dayNight('emissiveIntensity', 0.25, 3.2)} />
      </mesh>
      {withLight && <pointLight position={[-0.7, 4.0, 0]} intensity={0} distance={11} decay={1.5} color="#ffcf98" ref={dayNight('intensity', 0, 14)} />}
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

function rod(a, b, r, material, key) {
  const A = new THREE.Vector3(...a);
  const B = new THREE.Vector3(...b);
  const mid = A.clone().add(B).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return (
    <mesh key={key} position={mid} quaternion={q} material={material} castShadow>
      <cylinderGeometry args={[r, r, A.distanceTo(B), 8]} />
    </mesh>
  );
}

/** A step-through city bike with a wicker basket, parked by the booth. */
function Bicycle({ position }) {
  const frame = mat(PAL.tealDeep, { roughness: 0.45, metalness: 0.25 });
  const metal = mat('#9a958d', { metalness: 0.6, roughness: 0.35 });
  const tyre = mat('#262321', { roughness: 0.8 });
  const R = 0.32;
  const rear = [-0.52, R, 0];
  const front = [0.52, R, 0];
  const crank = [-0.05, 0.3, 0];
  const seat = [-0.22, 0.86, 0];
  const head = [0.36, 0.88, 0];
  return (
    <group position={position} rotation={[0.1, 0, 0]}>
      {[rear, front].map((p, i) => (
        <group key={i} position={p}>
          <mesh material={tyre} castShadow>
            <torusGeometry args={[R, 0.026, 8, 40]} />
          </mesh>
          <mesh material={metal}>
            <torusGeometry args={[R - 0.04, 0.008, 6, 40]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={metal}>
            <cylinderGeometry args={[0.03, 0.03, 0.06, 12]} />
          </mesh>
        </group>
      ))}
      {rod(rear, crank, 0.016, frame, 'a')}
      {rod(rear, seat, 0.016, frame, 'b')}
      {rod(crank, seat, 0.02, frame, 'c')}
      {rod(crank, head, 0.022, frame, 'd')}
      {rod(head, front, 0.018, frame, 'e')}
      {rod(seat, [-0.25, 0.98, 0], 0.012, metal, 'f')}
      {rod(head, [0.33, 1.06, 0], 0.014, metal, 'g')}
      {rod([0.33, 1.06, -0.24], [0.33, 1.06, 0.24], 0.012, metal, 'h')}
      <mesh position={[-0.26, 1.0, 0]} material={mat('#5c3d28')} castShadow>
        <boxGeometry args={[0.22, 0.05, 0.1]} />
      </mesh>
      <mesh position={[0.56, 0.92, 0]} material={mat('#b48a5c', { roughness: 0.9 })} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.34]} />
      </mesh>
      <mesh position={[0.56, 1.0, 0]} material={mat('#efe4cf')}>
        <boxGeometry args={[0.22, 0.04, 0.26]} />
      </mesh>
    </group>
  );
}

function PostBox({ position }) {
  const red = mat(PAL.terracotta, { roughness: 0.55 });
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]} material={mat('#4a4744')}>
        <cylinderGeometry args={[0.24, 0.26, 0.12, 24]} />
      </mesh>
      <mesh position={[0, 0.62, 0]} castShadow material={red}>
        <cylinderGeometry args={[0.2, 0.2, 1.0, 28]} />
      </mesh>
      <mesh position={[0, 1.12, 0]} castShadow material={red} scale={[1, 0.45, 1]}>
        <sphereGeometry args={[0.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 0.92, 0.19]} material={mat('#2a2622')}>
        <boxGeometry args={[0.18, 0.025, 0.03]} />
      </mesh>
      <mesh position={[0, 0.68, 0.2]} material={mat('#efe4cf')}>
        <boxGeometry args={[0.12, 0.08, 0.01]} />
      </mesh>
    </group>
  );
}

function PlantCrate({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.17, 0]} castShadow receiveShadow material={mat(PAL.woodLight)}>
        <boxGeometry args={[0.7, 0.34, 0.4]} />
      </mesh>
      {[-0.2, 0, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.17, 0.201]} material={mat(PAL.wood)}>
          <boxGeometry args={[0.02, 0.32, 0.005]} />
        </mesh>
      ))}
      <PottedPlant position={[-0.18, 0.34, 0]} scale={0.5} />
      <PottedPlant position={[0.18, 0.34, 0.02]} scale={0.42} />
      <mesh position={[0.45, 0.12, 0.1]} castShadow material={mat('#c9bfb0')}>
        <cylinderGeometry args={[0.12, 0.1, 0.24, 18]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0.45 + Math.cos(i * 1.3) * 0.05, 0.3 + (i % 2) * 0.05, 0.1 + Math.sin(i * 1.3) * 0.05]} material={mat(i % 2 ? '#c97a62' : '#efe4cf')}>
          <sphereGeometry args={[0.045, 10, 8]} />
        </mesh>
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
        <mesh key={i} position={[l.x, 0.4 + l.h / 2, l.z]} rotation={[Math.sin(l.a) * l.tilt, l.a, Math.cos(l.a) * l.tilt]} castShadow material={mat(i % 2 ? PAL.leaf : PAL.leafLight)}>
          <boxGeometry args={[0.06, l.h, 0.012]} />
        </mesh>
      ))}
    </group>
  );
}
