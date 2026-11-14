import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useApp } from '../store.js';
import { RoundedBox, Text } from '@react-three/drei';
import { MOVIES } from '../data/movies.js';
import { BOOTH, CABINET, FONT_HAND, FONT_SERIF, PAL, cubbyCenters, damp, dayNight, interaction, mat } from './world.js';
import { makeSampleStrips } from './Booth.jsx';
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
      <Beams />
      <WindowCurtains />
      <WallShelf />
      <StripGallery />
      <Cushion />
      <FloorLamp />
      <CoatHooks />
      <LightSwitch />
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
        <meshStandardMaterial color="#fff1d8" emissive="#ffd29a" emissiveIntensity={1.1} roughness={0.9} ref={dayNight('emissiveIntensity', 1.1, 2.6)} />
      </mesh>
      {[-0.12, 0, 0.12].map((y) => (
        <mesh key={y} position={[0, -0.62 + y, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#c9a77d')}>
          <torusGeometry args={[Math.sqrt(0.24 ** 2 - (y / 0.86) ** 2) + 0.002, 0.0025, 4, 40]} />
        </mesh>
      ))}
      <pointLight position={[0, -0.62, 0]} intensity={6} distance={7.5} decay={1.6} color="#ffcf98" castShadow={false} ref={dayNight('intensity', 5.5, 5)} />
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
        <meshStandardMaterial
          color="#ffe2b2"
          emissive="#ffc77e"
          emissiveIntensity={1.1}
          ref={(m) => {
            dayNight('emissiveIntensity', 1.1, 0.55)(m);
            if (m) dayNight('', '#ffc77e', '#3c4f86')(m.emissive);
            if (m) dayNight('', '#ffe2b2', '#2a3350')(m.color);
          }}
        />
      </mesh>
      <mesh position={[0, 0, 0.03]} material={mat(PAL.woodDark)}>
        <boxGeometry args={[0.03, 0.8, 0.02]} />
      </mesh>
      <mesh position={[0, 0, 0.03]} material={mat(PAL.woodDark)}>
        <boxGeometry args={[0.96, 0.03, 0.02]} />
      </mesh>
      <pointLight position={[0, 0, 0.45]} intensity={2.4} distance={4.5} decay={1.6} color="#ffc98e" ref={dayNight('intensity', 2.4, 0)} />
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


/* ---------- details: enough to look around, not so much it gets busy ---------- */

const ceil = BOOTH.wallH - 0.005;
/** Where the light switch sits, shared with its keyboard hotspot. */
export const SWITCH_POS = [1.56, 1.22, -innerZ + 0.012];

function Beams() {
  return (
    <group>
      {[-1.3, 0, 1.3].map((x) => (
        <mesh key={x} position={[x, ceil - 0.07, 0]} castShadow material={mat(PAL.woodDark, { roughness: 0.75 })}>
          <boxGeometry args={[0.12, 0.14, innerZ * 2]} />
        </mesh>
      ))}
    </group>
  );
}

/** Linen curtains drawn back from the side window. */
function WindowCurtains() {
  const linen = mat('#e8dcc6', { roughness: 0.95, side: THREE.DoubleSide });
  return (
    <group position={[innerX - 0.05, 1.75, 0.6]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, 0.56, 0.02]} rotation={[0, 0, Math.PI / 2]} material={mat('#8d877e', { metalness: 0.5, roughness: 0.4 })}>
        <cylinderGeometry args={[0.012, 0.012, 1.6, 8]} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.68, -0.08, 0.03]}>
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={i} position={[(i - 2) * 0.045, 0, Math.sin(i * 1.7) * 0.012]} material={linen} castShadow>
              <boxGeometry args={[0.05, 1.3, 0.01]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** A floating shelf: a film camera, a few books, a small plant. */
function WallShelf() {
  return (
    <group position={[1.62, 2.2, -innerZ + 0.12]}>
      <mesh castShadow receiveShadow material={mat(PAL.woodLight)}>
        <boxGeometry args={[0.95, 0.04, 0.22]} />
      </mesh>
      <group position={[-0.3, 0.09, 0]}>
        <mesh castShadow material={mat('#2a2826', { roughness: 0.5 })}>
          <boxGeometry args={[0.2, 0.12, 0.08]} />
        </mesh>
        <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow material={mat('#3a3734', { roughness: 0.3, metalness: 0.4 })}>
          <cylinderGeometry args={[0.04, 0.045, 0.06, 20]} />
        </mesh>
        <mesh position={[0.06, 0.075, 0]} material={mat('#c9c3b9', { metalness: 0.5, roughness: 0.35 })}>
          <boxGeometry args={[0.05, 0.03, 0.05]} />
        </mesh>
      </group>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0.02 + i * 0.045, 0.1 + (i % 2) * 0.01, 0]} rotation={[0, 0, i === 3 ? -0.18 : 0]} castShadow material={mat(['#9e4330', '#3c8a78', '#e9dfc9', '#5c3d28'][i])}>
          <boxGeometry args={[0.035, 0.18 + (i % 2) * 0.02, 0.15]} />
        </mesh>
      ))}
      <PottedPlant position={[0.36, 0.02, 0]} scale={0.32} />
    </group>
  );
}

/** Photostrips pinned along a string on the side wall. */
function StripGallery() {
  const strips = useMemo(() => makeSampleStrips(['denim', 'knit', 'cocoa', 'airmail']), []);
  return (
    <group position={[innerX - 0.012, 1.55, -0.85]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, 0.42, 0]} rotation={[0, 0, Math.PI / 2]} material={mat('#6a5a4a')}>
        <cylinderGeometry args={[0.004, 0.004, 1.3, 4]} />
      </mesh>
      {strips.map((tex, i) => (
        <group key={i} position={[-0.48 + i * 0.32, 0.02, 0.006]} rotation={[0, 0, (i % 2 ? 1 : -1) * 0.035]}>
          <mesh>
            <planeGeometry args={[0.22, 0.66]} />
            <meshStandardMaterial map={tex} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.36, 0.01]} material={mat('#b48a5c')}>
            <boxGeometry args={[0.03, 0.06, 0.012]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Cushion() {
  return (
    <group position={[0.8, 0, -0.42]} rotation={[0, 0.12, 0]}>
      <RoundedBox args={[0.62, 0.1, 0.62]} radius={0.045} smoothness={3} position={[0, 0.06, 0]} castShadow receiveShadow material={mat(PAL.terracotta, { roughness: 0.95 })} />
      <mesh position={[0, 0.115, 0]} material={mat('#7a3024')}>
        <cylinderGeometry args={[0.025, 0.025, 0.01, 10]} />
      </mesh>
    </group>
  );
}

function FloorLamp() {
  return (
    <group position={[-innerX + 0.3, 0, 0.55]}>
      <mesh position={[0, 0.02, 0]} material={mat('#3b3633', { metalness: 0.4 })}>
        <cylinderGeometry args={[0.16, 0.18, 0.03, 24]} />
      </mesh>
      <mesh position={[0, 0.8, 0]} material={mat('#3b3633', { metalness: 0.4 })}>
        <cylinderGeometry args={[0.012, 0.012, 1.56, 8]} />
      </mesh>
      <mesh position={[0, 1.62, 0]}>
        <cylinderGeometry args={[0.15, 0.22, 0.3, 28, 1, true]} />
        <meshStandardMaterial color="#efe2c8" emissive="#ffcf8c" emissiveIntensity={0.25} side={THREE.DoubleSide} roughness={0.9} ref={dayNight('emissiveIntensity', 0.25, 1.8)} />
      </mesh>
      <pointLight position={[0, 1.5, 0]} intensity={0} distance={3.2} decay={1.6} color="#ffc488" ref={dayNight('intensity', 0, 3.2)} />
    </group>
  );
}

/** On the wall by the door: hooks, a tote bag, a scarf, a small framed receipt. */
function CoatHooks() {
  const receipt = useMemo(() => makeSampleStrips(['reel'])[0], []);
  return (
    <group position={[-1.45, 1.72, innerZ - 0.02]} rotation={[0, Math.PI, 0]}>
      <mesh material={mat(PAL.woodDark)}>
        <boxGeometry args={[0.7, 0.07, 0.025]} />
      </mesh>
      {[-0.22, 0, 0.22].map((x) => (
        <mesh key={x} position={[x, -0.02, 0.04]} rotation={[0.6, 0, 0]} material={mat('#8d877e', { metalness: 0.5 })}>
          <cylinderGeometry args={[0.01, 0.01, 0.08, 6]} />
        </mesh>
      ))}
      <mesh position={[-0.22, -0.3, 0.05]} rotation={[0.05, 0, 0.04]} castShadow material={mat('#e3d6bd', { roughness: 0.95 })}>
        <boxGeometry args={[0.32, 0.38, 0.04]} />
      </mesh>
      <mesh position={[-0.22, -0.05, 0.05]} material={mat('#e3d6bd')}>
        <torusGeometry args={[0.08, 0.008, 6, 20, Math.PI]} />
      </mesh>
      <mesh position={[0.22, -0.32, 0.05]} castShadow material={mat(PAL.tealDeep, { roughness: 0.95 })}>
        <boxGeometry args={[0.1, 0.55, 0.03]} />
      </mesh>
      <group position={[0.75, 0.05, 0]}>
        <mesh material={mat(PAL.woodDark)}>
          <boxGeometry args={[0.3, 0.6, 0.02]} />
        </mesh>
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[0.2, 0.54]} />
          <meshStandardMaterial map={receipt} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/** The light switch by the shelf: day and night for the whole booth. */
function LightSwitch() {
  const toggle = useRef();
  useFrame((_, dt) => {
    if (!toggle.current) return;
    const night = useApp.getState().theme === 'night';
    toggle.current.rotation.x = damp(toggle.current.rotation.x, night ? 0.45 : -0.45, 14, Math.min(dt, 0.05));
  });
  const can = () => {
    const s = useApp.getState();
    return s.phase === 'inside' && s.station !== 'watch' && !s.inspectId;
  };
  const prompt = (e) => {
    const night = useApp.getState().theme === 'night';
    useApp.getState().setHover({ title: 'Light switch', cursor: night ? 'Day' : 'Night', actions: [['click', night ? 'Lights up' : 'Lights down']], x: e.clientX, y: e.clientY });
  };
  return (
    <group position={SWITCH_POS}>
      <mesh material={mat('#d8c7a4', { metalness: 0.55, roughness: 0.35 })} castShadow>
        <boxGeometry args={[0.09, 0.14, 0.012]} />
      </mesh>
      <mesh ref={toggle} position={[0, 0, 0.012]} material={mat('#f1e9db', { roughness: 0.4 })}>
        <boxGeometry args={[0.02, 0.05, 0.02]} />
      </mesh>
      <mesh
        position={[0, 0, 0.03]}
        onPointerOver={(e) => {
          if (!can()) return;
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          prompt(e);
        }}
        onPointerOut={() => {
          document.body.style.cursor = '';
          useApp.getState().setHover(null);
        }}
        onPointerDown={() => {
          if (can()) interaction.grabbed = true;
        }}
        onClick={(e) => {
          if (!can()) return;
          e.stopPropagation();
          useApp.getState().toggleTheme();
          prompt(e);
        }}
      >
        <boxGeometry args={[0.22, 0.28, 0.04]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
  );
}
