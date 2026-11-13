import { useMemo } from 'react';
import { RoundedBox, Text } from '@react-three/drei';
import { MOVIES } from '../data/movies.js';
import { BOOTH, CABINET, FONT_HAND, FONT_SERIF, PAL, cubbyCenters, mat } from './world.js';
import { canvasTexture } from './canvasTexture.js';
import { coverTexture } from './covers.js';
import { Machine } from './Machine.jsx';
import { Tapes } from './Tape.jsx';
import { Prints } from './Prints.jsx';
import { PottedPlant } from './Street.jsx';

const innerX = BOOTH.halfW - BOOTH.wall;
const innerZ = BOOTH.halfD - BOOTH.wall;

export function Interior() {
  return (
    <group>
      <Floor />
      <Rug />
      <Lantern />
      <WindowLight />
      <Poster />
      <Clock />
      <PottedPlant position={[-innerX + 0.32, 0, innerZ - 0.4]} scale={0.9} />
      <Rack />
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
        const planks = 10;
        const pw = w / planks;
        for (let i = 0; i < planks; i++) {
          const v = i % 3;
          ctx.fillStyle = ['#a8794f', '#9f714a', '#b08156'][v];
          ctx.fillRect(i * pw, 0, pw, h);
          ctx.fillStyle = 'rgba(60,38,24,0.5)';
          ctx.fillRect(i * pw, 0, 2, h);
          const seam = ((i * 337) % 760) + 100;
          ctx.fillRect(i * pw, seam, pw, 2);
          ctx.strokeStyle = 'rgba(60,38,24,0.1)';
          ctx.lineWidth = 1.5;
          for (let g = 0; g < 6; g++) {
            const gx = i * pw + 8 + g * (pw / 6);
            ctx.beginPath();
            ctx.moveTo(gx, 0);
            ctx.bezierCurveTo(gx + 5, h * 0.3, gx - 5, h * 0.6, gx + 3, h);
            ctx.stroke();
          }
        }
      }),
    [],
  );
  return (
    <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[innerX * 2, innerZ * 2]} />
      <meshStandardMaterial map={tex} roughness={0.7} />
    </mesh>
  );
}

function Rug() {
  const tex = useMemo(
    () =>
      canvasTexture(512, 320, (ctx, w, h) => {
        ctx.fillStyle = '#d9cbb3';
        ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 3) {
          ctx.fillStyle = y % 6 ? 'rgba(120,90,60,0.06)' : 'rgba(255,255,255,0.05)';
          ctx.fillRect(0, y, w, 1);
        }
        ctx.fillStyle = '#9e4330';
        for (const y of [26, 36, h - 40, h - 30]) ctx.fillRect(18, y, w - 36, 4);
        ctx.fillStyle = '#3c8a78';
        ctx.fillRect(18, 46, w - 36, 2);
        ctx.fillRect(18, h - 50, w - 36, 2);
      }),
    [],
  );
  return (
    <mesh position={[0.05, 0.01, 0.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[2.4, 1.5]} />
      <meshStandardMaterial map={tex} roughness={1} />
    </mesh>
  );
}

/** A paper lantern, the room's warm key light. */
function Lantern() {
  return (
    <group position={[0.1, BOOTH.wallH, -0.1]}>
      <mesh position={[0, -0.22, 0]} material={mat('#2b2420')}>
        <cylinderGeometry args={[0.006, 0.006, 0.44, 6]} />
      </mesh>
      <mesh position={[0, -0.62, 0]} scale={[1, 0.86, 1]}>
        <sphereGeometry args={[0.24, 28, 20]} />
        <meshStandardMaterial color="#fff1d8" emissive="#ffd29a" emissiveIntensity={1.4} roughness={0.9} />
      </mesh>
      {[-0.12, 0, 0.12].map((y) => (
        <mesh key={y} position={[0, -0.62 + y, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#c9a77d')}>
          <torusGeometry args={[Math.sqrt(0.24 ** 2 - (y / 0.86) ** 2) + 0.002, 0.0025, 4, 40]} />
        </mesh>
      ))}
      <pointLight position={[0, -0.62, 0]} intensity={7} distance={7.5} decay={1.6} color="#ffcf98" castShadow={false} />
    </group>
  );
}

/** Late sun through a window on the right wall. */
function WindowLight() {
  const x = innerX - 0.012;
  return (
    <group position={[x, 1.75, 0.6]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh material={mat(PAL.woodDark)}>
        <boxGeometry args={[1.08, 0.92, 0.04]} />
      </mesh>
      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[0.96, 0.8]} />
        <meshStandardMaterial color="#ffe2b2" emissive="#ffc77e" emissiveIntensity={1.1} />
      </mesh>
      <mesh position={[0, 0, 0.03]} material={mat(PAL.woodDark)}>
        <boxGeometry args={[0.03, 0.8, 0.02]} />
      </mesh>
      <mesh position={[0, 0, 0.03]} material={mat(PAL.woodDark)}>
        <boxGeometry args={[0.96, 0.03, 0.02]} />
      </mesh>
      <pointLight position={[0, 0, 0.45]} intensity={2.4} distance={4.5} decay={1.6} color="#ffc98e" />
    </group>
  );
}

function Poster() {
  const movie = MOVIES[MOVIES.length - 1];
  const tex = useMemo(() => coverTexture(movie), [movie]);
  return (
    <group position={[0.15, 1.95, -innerZ + 0.03]} rotation={[0, 0, 0.012]}>
      <RoundedBox args={[0.5, 0.82, 0.03]} radius={0.008} smoothness={2} material={mat(PAL.woodDark)} />
      <mesh position={[0, 0, 0.017]}>
        <planeGeometry args={[0.44, 0.76]} />
        <meshStandardMaterial map={tex} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Clock() {
  return (
    <group position={[-0.62, 2.35, -innerZ + 0.03]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={mat('#e9e1d2')}>
        <cylinderGeometry args={[0.15, 0.15, 0.03, 32]} />
      </mesh>
      <mesh position={[0, 0, 0.016]} rotation={[Math.PI / 2, 0, 0]} material={mat(PAL.woodDark)}>
        <torusGeometry args={[0.15, 0.012, 6, 40]} />
      </mesh>
      <mesh position={[0.03, 0.02, 0.02]} rotation={[0, 0, -1.1]} material={mat(PAL.ink)}>
        <boxGeometry args={[0.012, 0.1, 0.004]} />
      </mesh>
      <mesh position={[-0.01, 0.045, 0.022]} rotation={[0, 0, 0.25]} material={mat(PAL.ink)}>
        <boxGeometry args={[0.008, 0.12, 0.004]} />
      </mesh>
    </group>
  );
}

/** The video rental rack: slanted shelves, a hand-written tag under each tape. */
function Rack() {
  const { x, z, w, h, d } = CABINET;
  const wood = mat(PAL.woodLight, { roughness: 0.7 });
  const dark = mat(PAL.woodDark, { roughness: 0.75 });
  const cubbies = useMemo(cubbyCenters, []);
  const rows = [0, 1, 2].map((r) => cubbies[r * 3]);
  return (
    <group>
      <mesh position={[x, h / 2, z - d / 2 + 0.015]} material={mat('#5a6b66', { roughness: 0.85 })} receiveShadow>
        <boxGeometry args={[w, h, 0.03]} />
      </mesh>
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.06, h, d]} radius={0.01} smoothness={2} position={[x + s * (w / 2 - 0.03), h / 2, z]} castShadow receiveShadow material={wood} />
      ))}
      <RoundedBox args={[w + 0.06, 0.07, d + 0.04]} radius={0.012} smoothness={2} position={[x, h - 0.035, z + 0.01]} castShadow material={dark} />
      <RoundedBox args={[w, 0.16, d]} radius={0.012} smoothness={2} position={[x, 0.08, z]} castShadow receiveShadow material={dark} />
      {rows.map((c, i) => (
        <group key={i}>
          <mesh position={[x, c.floorY - 0.018, z]} castShadow receiveShadow material={wood}>
            <boxGeometry args={[w - 0.12, 0.035, d - 0.03]} />
          </mesh>
          {/* lip */}
          <mesh position={[x, c.floorY + 0.03, z + d / 2 - 0.03]} material={dark}>
            <boxGeometry args={[w - 0.12, 0.06, 0.02]} />
          </mesh>
        </group>
      ))}
      {/* hand-written year tags on the lips */}
      {MOVIES.slice(0, 9).map((m, i) => {
        const c = cubbies[i];
        return (
          <group key={m.id} position={[c.x, c.floorY + 0.03, z + d / 2 - 0.018]} rotation={[0, 0, (i % 2 ? 1 : -1) * 0.02]}>
            <mesh material={mat('#f1e8d6')}>
              <planeGeometry args={[0.16, 0.05]} />
            </mesh>
            <Text font={FONT_HAND} fontSize={0.036} color={PAL.ink} position={[0, -0.002, 0.002]} anchorX="center" anchorY="middle">
              {m.year}
            </Text>
          </group>
        );
      })}
      <group position={[x, h + 0.16, z + 0.08]}>
        <RoundedBox args={[0.7, 0.2, 0.03]} radius={0.01} smoothness={2} material={dark} castShadow />
        <Text font={FONT_SERIF} fontSize={0.085} letterSpacing={0.2} color="#efe4cf" position={[0, 0, 0.017]} anchorX="center" anchorY="middle">
          FILMS
        </Text>
      </group>
      {/* props in the empty slots */}
      {cubbies.slice(MOVIES.length).map((c, i) => (
        <group key={c.index} position={[c.x, c.floorY, c.z - 0.06]}>
          {i % 2 === 0 ? (
            <>
              {[0, 1, 2].map((k) => (
                <mesh key={k} position={[-0.08 + k * 0.06, 0.2, 0]} rotation={[0, 0, -0.08]} material={mat(['#2f2a27', '#3b3532', '#2a2522'][k])} castShadow>
                  <boxGeometry args={[0.05, 0.4, 0.24]} />
                </mesh>
              ))}
            </>
          ) : (
            <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#8d877e', { metalness: 0.5, roughness: 0.4 })} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
