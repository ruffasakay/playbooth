import { useMemo } from 'react';
import { RoundedBox, Text } from '@react-three/drei';
import { MOVIES } from '../data/movies.js';
import { CABINET, FONT_URL, PAL, clay, cubbyCenters } from './world.js';

export function Cabinet() {
  const { x, z, w, h, d } = CABINET;
  const wood = clay(PAL.honey);
  const dark = clay(PAL.walnut);
  const cubbies = useMemo(cubbyCenters, []);
  const side = 0.07;
  const top = 0.08;
  const plinth = 0.14;
  const shelf = 0.05;
  const innerW = w - side * 2;
  const rowH = (h - top - plinth - shelf * 2) / 3;
  const empties = cubbies.slice(MOVIES.length);

  return (
    <group>
      {/* carcass */}
      <RoundedBox args={[w, h, 0.05]} radius={0.02} smoothness={2} position={[x, h / 2, z - d / 2 + 0.025]} material={clay(PAL.cherryDeep)} receiveShadow />
      <RoundedBox args={[side, h, d]} radius={0.025} smoothness={2} position={[x - w / 2 + side / 2, h / 2, z]} material={wood} castShadow receiveShadow />
      <RoundedBox args={[side, h, d]} radius={0.025} smoothness={2} position={[x + w / 2 - side / 2, h / 2, z]} material={wood} castShadow receiveShadow />
      <RoundedBox args={[w + 0.08, top, d + 0.06]} radius={0.03} smoothness={2} position={[x, h - top / 2, z + 0.02]} material={dark} castShadow />
      <RoundedBox args={[w, plinth, d]} radius={0.03} smoothness={2} position={[x, plinth / 2, z]} material={dark} castShadow receiveShadow />
      {[1, 2].map((i) => (
        <RoundedBox
          key={i}
          args={[innerW, shelf, d - 0.02]}
          radius={0.015}
          smoothness={2}
          position={[x, h - top - i * rowH - (i - 0.5) * shelf, z]}
          material={wood}
          receiveShadow
          castShadow
        />
      ))}
      {/* dividers */}
      {[1, 2].map((i) => (
        <mesh key={i} position={[x - innerW / 2 + (innerW / 3) * i, (h - top + plinth) / 2, z]} material={wood} receiveShadow>
          <boxGeometry args={[0.025, h - top - plinth, d - 0.04]} />
        </mesh>
      ))}
      {/* shelf lips that keep tapes from sliding */}
      {[0, 1, 2].map((row) => (
        <mesh key={row} position={[x, h - top - (row + 1) * rowH - row * shelf + 0.03, z + d / 2 - 0.02]} material={dark}>
          <boxGeometry args={[innerW, 0.04, 0.025]} />
        </mesh>
      ))}

      {/* sign on top */}
      <group position={[x, h + 0.2, z + 0.1]}>
        <RoundedBox args={[1.02, 0.3, 0.06]} radius={0.05} smoothness={3} material={clay(PAL.butter)} castShadow />
        <Text font={FONT_URL} fontSize={0.12} color={PAL.ink} anchorX="center" anchorY="middle" position={[0, 0.005, 0.035]}>
          Pick a tape
        </Text>
        {[-0.38, 0.38].map((sx) => (
          <mesh key={sx} position={[sx, -0.17, 0]} material={dark}>
            <boxGeometry args={[0.03, 0.06, 0.03]} />
          </mesh>
        ))}
      </group>

      {/* props in cubbies without tapes */}
      {empties.map((c, i) => (
        <CubbyProp key={c.index} kind={i % 3} cubby={c} />
      ))}
    </group>
  );
}

function CubbyProp({ kind, cubby }) {
  const y = cubby.floorY;
  if (kind === 0) {
    // popcorn box
    return (
      <group position={[cubby.x, y, cubby.z - 0.05]}>
        <mesh position={[0, 0.13, 0]} material={clay(PAL.paper)} castShadow>
          <cylinderGeometry args={[0.1, 0.075, 0.26, 4, 1]} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 0.13, 0]} rotation={[0, (i * Math.PI) / 2 + Math.PI / 4, 0]} material={clay(PAL.cherry)}>
            <cylinderGeometry args={[0.1005, 0.0755, 0.26, 4, 1, true, 0, 0.35]} />
          </mesh>
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[Math.cos(i * 2.1) * 0.05, 0.28 + (i % 3) * 0.025, Math.sin(i * 2.1) * 0.05]} material={clay('#fff3cf')}>
            <sphereGeometry args={[0.032, 8, 6]} />
          </mesh>
        ))}
      </group>
    );
  }
  if (kind === 1) {
    // film canisters, stacked
    return (
      <group position={[cubby.x, y, cubby.z - 0.06]}>
        {[0, 1].map((i) => (
          <group key={i} position={[i * 0.02, 0.025 + i * 0.05, 0]} rotation={[0, i * 0.5, 0]}>
            <mesh material={clay(i ? PAL.periwinkle : PAL.mint)} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.045, 32]} />
            </mesh>
            <mesh position={[0, 0.024, 0]} material={clay(PAL.paper)}>
              <cylinderGeometry args={[0.04, 0.04, 0.005, 16]} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }
  // little plant
  return (
    <group position={[cubby.x, y, cubby.z - 0.05]}>
      <mesh position={[0, 0.07, 0]} material={clay(PAL.peach)} castShadow>
        <cylinderGeometry args={[0.07, 0.055, 0.14, 16]} />
      </mesh>
      {[
        [0, 0.21, 0, 0.08],
        [-0.05, 0.18, 0.02, 0.06],
        [0.05, 0.19, -0.01, 0.065],
      ].map(([px, py, pz, r], i) => (
        <mesh key={i} position={[px, py, pz]} material={clay(PAL.mintDeep)}>
          <sphereGeometry args={[r, 12, 10]} />
        </mesh>
      ))}
    </group>
  );
}
