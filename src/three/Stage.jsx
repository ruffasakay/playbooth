import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { useApp } from '../store.js';
import { PAL, clay } from './world.js';
import { Booth } from './Booth.jsx';
import { Interior } from './Interior.jsx';
import { CameraRig } from './CameraRig.jsx';
import { Hotspots } from './Hotspots.jsx';

export default function Stage() {
  const [dpr, setDpr] = useState(() => Math.min(1.75, window.devicePixelRatio || 1));
  return (
    <div className="stage" aria-hidden="true">
      <Canvas
        shadows
        dpr={dpr}
        camera={{ fov: 42, near: 0.05, far: 160, position: [-6, 4, 8] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NeutralToneMapping;
          gl.toneMappingExposure = 1.02;
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(Math.min(1.75, window.devicePixelRatio || 1))}
        />
        <color attach="background" args={[PAL.sky]} />
        <fog attach="fog" args={[PAL.sky, 28, 70]} />
        <SkyDome />
        <Lights />
        <Ground />
        <Booth />
        <Interior />
        <CameraRig />
        <Hotspots />
        <ReadySignal />
      </Canvas>
    </div>
  );
}

function Lights() {
  return (
    <>
      <hemisphereLight args={['#f4f2ff', '#b5dcc0', 1.55]} />
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[-7, 11, 8]}
        intensity={2.4}
        color="#fff0da"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={34}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
      />
    </>
  );
}

function SkyDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: new THREE.Color(PAL.skyTop) },
          mid: { value: new THREE.Color(PAL.sky) },
          bottom: { value: new THREE.Color(PAL.horizon) },
        },
        vertexShader: `varying vec3 vPos; void main(){ vPos = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vPos;
          void main(){ float h = vPos.y; vec3 c = h > 0.08 ? mix(mid, top, smoothstep(0.08, 0.7, h)) : mix(bottom, mid, smoothstep(-0.05, 0.08, h)); gl_FragColor = vec4(c, 1.0); }`,
      }),
    [],
  );
  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[90, 32, 16]} />
    </mesh>
  );
}

function Ground() {
  const trees = useMemo(
    () => [
      [-6.5, -8.5, 1.3],
      [-2.5, -11, 1.0],
      [6.5, -7.5, 1.4],
      [9.5, -2.5, 1.1],
      [10.5, 3.5, 0.9],
      [3.5, -12, 0.95],
      [-4.5, -13, 1.15],
    ],
    [],
  );
  const flowers = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const a = i * 2.39996;
        const r = 4.2 + ((i * 37) % 50) / 10;
        return [Math.cos(a) * r, Math.sin(a) * r * 0.8 + 1.5, [PAL.paper, PAL.butter, '#ffd0de'][i % 3]];
      }).filter(([x, z]) => !(Math.abs(x) < 1.2 && z > 2)),
    [],
  );
  return (
    <group>
      <mesh position={[0, -0.56, 0]} receiveShadow>
        <cylinderGeometry args={[18, 18.4, 0.4, 72]} />
        <meshStandardMaterial color={PAL.grass} roughness={1} />
      </mesh>
      {trees.map(([x, z, s], i) => (
        <group key={i} position={[x, -0.36, z]} scale={s}>
          <mesh position={[0, 0.5, 0]} castShadow material={clay(PAL.walnut)}>
            <cylinderGeometry args={[0.14, 0.2, 1, 10]} />
          </mesh>
          <mesh position={[0, 1.45, 0]} castShadow material={clay(i % 2 ? PAL.grassDark : PAL.mintDeep)}>
            <sphereGeometry args={[0.95, 20, 16]} />
          </mesh>
          <mesh position={[0.45, 1.15, 0.3]} castShadow material={clay(i % 2 ? PAL.mintDeep : PAL.grassDark)}>
            <sphereGeometry args={[0.55, 16, 12]} />
          </mesh>
        </group>
      ))}
      {flowers.map(([x, z, color], i) => (
        <group key={i} position={[x, -0.34, z]}>
          <mesh position={[0, 0.08, 0]} material={clay(PAL.mintDeep)}>
            <cylinderGeometry args={[0.012, 0.012, 0.16, 5]} />
          </mesh>
          <mesh position={[0, 0.17, 0]} material={clay(color)}>
            <sphereGeometry args={[0.06, 10, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Tells the preloader the scene has rendered a few real frames. */
function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current > 3) return;
    frames.current += 1;
    if (frames.current === 3) {
      document.fonts.ready.then(() => useApp.setState({ sceneReady: true }));
    }
  });
  return null;
}
