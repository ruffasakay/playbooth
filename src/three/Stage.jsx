import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useApp } from '../store.js';
import { PAL, applyLight, dayNight, light } from './world.js';
import { Street } from './Street.jsx';
import { Booth } from './Booth.jsx';
import { Interior } from './Interior.jsx';
import { CameraRig } from './CameraRig.jsx';
import { Hotspots } from './Hotspots.jsx';

const forceLite = typeof location !== 'undefined' && new URLSearchParams(location.search).has('lite');

export default function Stage() {
  // start the scene already in the saved theme, no fade on load
  useState(() => {
    light.t = useApp.getState().theme === 'night' ? 1 : 0;
  });
  const [dpr, setDpr] = useState(() => (forceLite ? 0.6 : Math.min(1.75, window.devicePixelRatio || 1)));
  // Lite mode drops shadows and reflections for devices that can't keep up.
  const [lite, setLite] = useState(forceLite);
  const declines = useRef(0);
  const inside = useApp((s) => s.phase === 'inside');
  return (
    <div className="stage" data-inside={inside || undefined} aria-hidden="true">
      <Canvas
        shadows={!lite}
        dpr={dpr}
        camera={{ fov: 40, near: 0.05, far: 160, position: [-6, 3, 9] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.95 - light.t * 0.2;
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        <PerformanceMonitor
          onDecline={() => {
            declines.current += 1;
            setDpr(1);
            if (declines.current >= 2) setLite(true);
          }}
          onIncline={() => !lite && setDpr(Math.min(1.75, window.devicePixelRatio || 1))}
        />
        <color attach="background" args={[PAL.haze]} ref={dayNight('', PAL.haze, '#22242f')} />
        <fog attach="fog" args={[PAL.haze, 16, 46]} ref={dayNight('color', PAL.haze, '#22242f')} />
        <DayNight />
        {!lite && <SoftEnvironment />}
        <SkyDome />
        <Lights />
        <Street />
        <Booth />
        <Interior />
        <CameraRig />
        <Hotspots />
        <ReadySignal />
      </Canvas>
      <div className="stage-grain" />
      <div className="stage-night" />
    </div>
  );
}

/** Golden hour: one low, warm sun and a cool sky fill. */
function Lights() {
  return (
    <>
      <hemisphereLight
        ref={(h) => {
          dayNight('intensity', 0.85, 0.1)(h);
          if (h) dayNight('', '#f3e6d2', '#5b6788')(h.color);
          if (h) dayNight('', '#7a6252', '#2a2420')(h.groundColor);
        }}
        args={['#f3e6d2', '#7a6252', 0.85]}
      />
      <directionalLight
        ref={(l) => {
          dayNight('intensity', 3.1, 0.35)(l);
          if (l) dayNight('', '#ffcf9c', '#9db1ff')(l.color);
        }}
        position={[9, 6.5, 7]}
        intensity={3.1}
        color="#ffcf9c"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={9}
        shadow-camera-bottom={-7}
        shadow-camera-near={1}
        shadow-camera-far={34}
        shadow-bias={-0.0003}
        shadow-normalBias={0.03}
        shadow-radius={3}
      />
    </>
  );
}

/** Procedural studio environment for soft reflections, no downloads. */
function SoftEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.28;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/** Eases the whole scene toward the theme: 0 is day, 1 is night. */
function DayNight() {
  const { gl } = useThree();
  useFrame((_, dt) => {
    const s = useApp.getState();
    const target = s.theme === 'night' ? 1 : 0;
    if (light.t === target) return;
    const k = s.reducedMotion ? 1 : 1 - Math.exp(-3.2 * Math.min(dt, 0.05));
    const t = Math.abs(target - light.t) < 0.002 ? target : light.t + (target - light.t) * k;
    applyLight(t);
    gl.toneMappingExposure = 0.95 - t * 0.2;
  });
  return null;
}

function SkyDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: new THREE.Color(PAL.hazeTop) },
          mid: { value: new THREE.Color(PAL.haze) },
          low: { value: new THREE.Color(PAL.horizon) },
          sun: { value: new THREE.Vector3(0.75, 0.32, 0.58).normalize() },
          glowAmount: { value: 0.35 },
        },
        vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 low; uniform vec3 sun; uniform float glowAmount; varying vec3 vDir;
          void main(){
            float h = vDir.y;
            vec3 c = mix(low, mid, smoothstep(-0.02, 0.18, h));
            c = mix(c, top, smoothstep(0.18, 0.8, h));
            float glow = pow(max(dot(normalize(vDir), sun), 0.0), 6.0);
            c += vec3(1.0, 0.78, 0.52) * glow * glowAmount;
            gl_FragColor = vec4(c, 1.0);
          }`,
      }),
    [],
  );
  return (
    <mesh
      material={material}
      renderOrder={-1}
      ref={(m) => {
        if (!m) return;
        const u = material.uniforms;
        dayNight('value', PAL.hazeTop, '#0f1322')(u.top);
        dayNight('value', PAL.haze, '#252838')(u.mid);
        dayNight('value', PAL.horizon, '#4a3a4a')(u.low);
        dayNight('value', 0.35, 0.08)(u.glowAmount);
      }}
    >
      <sphereGeometry args={[90, 32, 16]} />
    </mesh>
  );
}

function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current > 3) return;
    frames.current += 1;
    if (frames.current === 3) document.fonts.ready.then(() => useApp.setState({ sceneReady: true }));
  });
  return null;
}
