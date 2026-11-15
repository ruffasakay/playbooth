import { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { movieById } from '../store.js';
import { PAL, dayNight, mat } from './world.js';
import { POSTER_ASPECT, posterTexture } from './covers.js';

/*
 * The films' posters, set-dressed like a small cinema street: lit one-sheet
 * cases on the booth, an advertising column on the corner, wooden frames
 * inside. Every layer stands a few millimetres clear of the one behind it
 * and no two outer faces share a plane, so nothing flickers.
 */

function usePosterMaterial(id, glow) {
  return useMemo(() => {
    const movie = movieById(id);
    const map = posterTexture(movie);
    const m = new THREE.MeshStandardMaterial({ map, color: map ? '#ffffff' : movie?.colors?.shell ?? '#5a483a', roughness: 0.42 });
    if (glow && map) {
      // a lightbox: the poster lights itself a little at night
      m.emissiveMap = map;
      m.emissive = new THREE.Color('#ffffff');
      m.emissiveIntensity = 0;
    }
    return m;
  }, [id, glow]);
}

/** A cinema's one-sheet case: dark metal frame, the poster under it, lit from behind after dark. */
export function PosterCase({ id, width = 0.56, glow = true, ...props }) {
  const w = width;
  const h = w / POSTER_ASPECT;
  const material = usePosterMaterial(id, glow);
  const frame = mat('#2b221b', { roughness: 0.45, metalness: 0.35 });
  const B = 0.05; // frame bar width
  return (
    <group {...props}>
      {/* backing, inset from the bars so no side faces line up */}
      <mesh position={[0, 0, 0.02]} material={mat('#1c1612', { roughness: 0.8 })} castShadow>
        <boxGeometry args={[w + B * 1.6, h + B * 1.6, 0.034]} />
      </mesh>
      <mesh position={[0, 0, 0.043]} material={material} ref={glow ? dayNight('emissiveIntensity', 0, 0.42) : undefined}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`h${s}`} position={[0, s * (h / 2 + B / 2), 0.032]} material={frame} castShadow>
          <boxGeometry args={[w + B * 2, B, 0.058]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`v${s}`} position={[s * (w / 2 + B / 2), 0, 0.032]} material={frame} castShadow>
          <boxGeometry args={[B, h - 0.002, 0.058]} />
        </mesh>
      ))}
    </group>
  );
}

/** A framed poster for a room: a wooden frame, a cream mat, the poster. */
export function PosterFrame({ id, width = 0.42, ...props }) {
  const w = width;
  const h = w / POSTER_ASPECT;
  const material = usePosterMaterial(id, false);
  const MAT = 0.035;
  const B = 0.04;
  const wood = mat(PAL.woodDark, { roughness: 0.6 });
  return (
    <group {...props}>
      <mesh position={[0, 0, 0.012]} material={mat('#efe6d6', { roughness: 0.95 })}>
        <boxGeometry args={[w + MAT * 2, h + MAT * 2, 0.02]} />
      </mesh>
      <mesh position={[0, 0, 0.0245]} material={material}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`h${s}`} position={[0, s * (h / 2 + MAT + B / 2), 0.02]} material={wood} castShadow>
          <boxGeometry args={[w + MAT * 2 + B * 2, B, 0.04]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`v${s}`} position={[s * (w / 2 + MAT + B / 2), 0, 0.02]} material={wood} castShadow>
          <boxGeometry args={[B, h + MAT * 2 - 0.002, 0.04]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * An advertising column on the corner, the old kind with a little dome:
 * three posters wrapped on its drum, one turned to face the street's camera.
 */
export function PosterColumn({ ids, face = 0.67, ...props }) {
  const R = 0.3;
  const RP = R + 0.006;
  const W = 0.5;
  const H = W / POSTER_ASPECT;
  const arc = W / RP;
  const y = 1.47;
  const body = mat(PAL.tealDeep, { roughness: 0.7 });
  const trim = mat('#1f3f39', { roughness: 0.55, metalness: 0.2 });
  const m0 = usePosterMaterial(ids[0], false);
  const m1 = usePosterMaterial(ids[1], false);
  const m2 = usePosterMaterial(ids[2], false);
  const mats = [m0, m1, m2];
  return (
    <group {...props}>
      <mesh position={[0, 0.09, 0]} material={trim} castShadow receiveShadow>
        <cylinderGeometry args={[R + 0.07, R + 0.09, 0.18, 32]} />
      </mesh>
      <mesh position={[0, 1.12, 0]} material={body} castShadow receiveShadow>
        <cylinderGeometry args={[R, R, 2.0, 40]} />
      </mesh>
      <mesh position={[0, 1.04, 0]} material={trim}>
        <cylinderGeometry args={[R + 0.022, R + 0.022, 0.06, 40]} />
      </mesh>
      {mats.map((m, i) => (
        <mesh key={i} position={[0, y, 0]} material={m}>
          <cylinderGeometry args={[RP, RP, H, 32, 1, true, face - arc / 2 + (i * Math.PI * 2) / 3, arc]} />
        </mesh>
      ))}
      <mesh position={[0, 2.16, 0]} material={trim} castShadow>
        <cylinderGeometry args={[R + 0.07, R + 0.03, 0.1, 40]} />
      </mesh>
      <mesh position={[0, 2.21, 0]} scale={[1, 0.62, 1]} material={body} castShadow>
        <sphereGeometry args={[R + 0.045, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 2.46, 0]} material={trim}>
        <sphereGeometry args={[0.045, 16, 10]} />
      </mesh>
    </group>
  );
}
