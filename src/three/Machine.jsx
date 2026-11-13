import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import { useApp, movieById } from '../store.js';
import { FONT_MONO, FONT_SERIF, MACHINE, PAL, PRINTER, SCREEN, SLOT, TABLE, TRAY, TV, VCR, damp, interaction, mat } from './world.js';
import { FONT_MONO as CSS_MONO, borderById, formatDate, frameLayout, paintOverlay } from '../data/borders.js';

export function Machine() {
  return (
    <group>
      <Console />
      <Television />
      <Vcr />
      <SideTable />
      <Printer />
      <Tray />
    </group>
  );
}

const hoverHandlers = (prompt, canShow) => ({
  onPointerOver: (e) => {
    if (!canShow()) return;
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    useApp.getState().setHover({ ...prompt, x: e.clientX, y: e.clientY });
  },
  onPointerMove: (e) => {
    if (!canShow() || e.pointerType !== 'mouse') return;
    useApp.getState().setHover({ ...prompt, x: e.clientX, y: e.clientY });
  },
  onPointerOut: () => {
    document.body.style.cursor = '';
    useApp.getState().setHover(null);
  },
  onPointerDown: () => {
    if (canShow()) interaction.grabbed = true;
  },
});

const inRoom = () => {
  const s = useApp.getState();
  return s.phase === 'inside' && s.station !== 'watch' && !s.inspectId;
};

function Console() {
  const { x, z, w, h, d } = MACHINE;
  const wood = mat(PAL.wood, { roughness: 0.62 });
  const dark = mat(PAL.woodDark, { roughness: 0.7 });
  return (
    <group>
      <RoundedBox args={[w, 0.05, d]} radius={0.012} smoothness={2} position={[x, h - 0.025, z]} castShadow receiveShadow material={wood} />
      <RoundedBox args={[w, 0.04, d]} radius={0.01} smoothness={2} position={[x, 0.16, z]} castShadow receiveShadow material={wood} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[x + s * (w / 2 - 0.02), h / 2 + 0.05, z]} castShadow material={wood}>
          <boxGeometry args={[0.04, h - 0.1, d]} />
        </mesh>
      ))}
      <mesh position={[x, h / 2 + 0.05, z - d / 2 + 0.01]} material={dark}>
        <boxGeometry args={[w - 0.06, h - 0.1, 0.02]} />
      </mesh>
      {/* tapered legs */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[x + sx * (w / 2 - 0.08), 0.07, z + sz * (d / 2 - 0.08)]} rotation={[sz * 0.08, 0, -sx * 0.08]} castShadow material={dark}>
          <cylinderGeometry args={[0.022, 0.014, 0.15, 10]} />
        </mesh>
      ))}
      {/* a few tapes stacked on the lower shelf */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[x + 0.36, 0.205 + i * 0.03, z + 0.05]} rotation={[0, 0.05 * i, 0]} castShadow material={mat(['#2a2623', '#3a3330', '#272220'][i])}>
          <boxGeometry args={[0.24, 0.028, 0.4]} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- picture tube ---------- */

class ScreenPainter {
  constructor(width = 1024, height = 768) {
    this.width = width;
    this.height = height;
    this.canvas = this.makeCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.tainted = false;
    this.overlayKey = '';
  }

  makeCanvas() {
    const c = document.createElement('canvas');
    c.width = this.width;
    c.height = this.height;
    return c;
  }

  resetCanvas() {
    this.canvas = this.makeCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.texture.image = this.canvas;
    this.texture.needsUpdate = true;
  }

  tube() {
    const { ctx, width: w, height: h } = this;
    // scanlines and the curved glass falloff
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);
    const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.85);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, w * 0.6, h * 0.7);
    g.addColorStop(0, 'rgba(255,255,255,0.08)');
    g.addColorStop(0.5, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  paintOff() {
    const { ctx, width: w, height: h } = this;
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
    g.addColorStop(0, '#2b2d2a');
    g.addColorStop(1, '#121312');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    this.tube();
  }

  /** The VCR's blue screen with its on-screen display. */
  paintReading(time, movie) {
    const { ctx, width: w, height: h } = this;
    ctx.fillStyle = '#2f4a8c';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#eef2ff';
    ctx.font = `bold 54px ${CSS_MONO}`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(Math.floor(time * 2) % 2 ? 'PLAY ▶' : 'PLAY', 64, 56);
    ctx.font = `40px ${CSS_MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText('SP', w - 64, 56);
    ctx.textAlign = 'center';
    ctx.font = `44px ${CSS_MONO}`;
    ctx.fillText((movie?.title ?? '').toUpperCase(), w / 2, h - 140);
    this.tube();
  }

  paintShow({ video, borderId, aspect, movie }) {
    const { ctx, width: w, height: h } = this;
    ctx.fillStyle = '#0c0c0b';
    ctx.fillRect(0, 0, w, h);
    const border = borderById(borderId);
    const probe = frameLayout(border, aspect, 1000);
    const scale = Math.min((w * 0.94) / probe.W, (h * 0.92) / probe.H);
    const layoutW = Math.round(probe.W * scale);
    const key = `${border.id}|${aspect.toFixed(3)}|${movie?.id}|${layoutW}`;
    if (key !== this.overlayKey) {
      const L = frameLayout(border, aspect, layoutW);
      const c = document.createElement('canvas');
      c.width = L.W;
      c.height = L.H;
      paintOverlay(c.getContext('2d'), border, L, { title: movie?.title, date: formatDate() });
      this.overlay = { canvas: c, L };
      this.overlayKey = key;
    }
    const { canvas: overlay, L } = this.overlay;
    const ox = Math.round((w - L.W) / 2);
    const oy = Math.round((h - L.H) / 2);
    const win = L.win;
    ctx.fillStyle = '#000';
    ctx.fillRect(ox + win.x, oy + win.y, win.w, win.h);
    if (video && video.readyState >= 2 && video.videoWidth > 0 && !this.tainted) {
      ctx.drawImage(video, ox + win.x, oy + win.y, win.w, win.h);
      try {
        ctx.getImageData(ox + win.x + 2, oy + win.y + 2, 1, 1);
      } catch {
        this.tainted = true;
        this.resetCanvas();
        this.paintShow({ video: null, borderId, aspect, movie });
        return;
      }
    }
    ctx.drawImage(overlay, ox, oy);
    this.tube();
  }
}

function Television() {
  const painter = useMemo(() => new ScreenPainter(), []);
  const last = useRef(0);
  useEffect(() => () => painter.texture.dispose(), [painter]);

  useFrame(({ clock }) => {
    const s = useApp.getState();
    if (s.phase === 'inside' && s.station === 'watch') return;
    const t = clock.elapsedTime;
    const playing = s.videoEl && !s.videoEl.paused;
    if (t - last.current < (playing ? 1 / 30 : 1 / 8)) return;
    last.current = t;
    const movie = movieById(s.insertedTapeId);
    if (!movie) painter.paintOff();
    else if (s.deck === 'reading') painter.paintReading(s.reducedMotion ? 1 : t, movie);
    else painter.paintShow({ video: s.videoEl, borderId: s.borderId, aspect: s.videoAspect, movie });
    painter.texture.needsUpdate = true;
  });

  const canWatch = () => {
    const s = useApp.getState();
    return inRoom() && !!s.insertedTapeId && s.deck !== 'reading';
  };
  const handlers = hoverHandlers({ title: 'Television', actions: [['click', 'Sit and watch']] }, canWatch);

  const cream = mat('#e3dccf', { roughness: 0.45 });
  return (
    <group>
      <RoundedBox args={[TV.w, TV.h, TV.d]} radius={0.06} smoothness={4} position={[TV.x, TV.y, TV.z]} castShadow receiveShadow material={cream} />
      {/* rear hump of the tube */}
      <RoundedBox args={[TV.w * 0.72, TV.h * 0.72, 0.3]} radius={0.08} smoothness={3} position={[TV.x, TV.y + 0.02, TV.z - TV.d / 2 - 0.1]} castShadow material={cream} />
      <RoundedBox args={[SCREEN.w + 0.1, SCREEN.h + 0.1, 0.02]} radius={0.05} smoothness={3} position={[SCREEN.x, SCREEN.y, TV.front + 0.004]} material={mat('#2a2826', { roughness: 0.6 })} />
      <mesh
        position={[SCREEN.x, SCREEN.y, SCREEN.z]}
        {...handlers}
        onClick={(e) => {
          if (!canWatch()) return;
          e.stopPropagation();
          useApp.getState().goStation('watch');
        }}
      >
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        <meshBasicMaterial map={painter.texture} toneMapped={false} />
      </mesh>
      <Text font={FONT_SERIF} fontSize={0.03} letterSpacing={0.25} color="#6a6157" position={[SCREEN.x, TV.y - TV.h / 2 + 0.07, TV.front + 0.002]} anchorX="center">
        PLAYBOOTH
      </Text>
    </group>
  );
}

function Vcr() {
  const flap = useRef();
  useFrame((_, dt) => {
    const s = useApp.getState();
    if (flap.current) {
      const open = s.insertingId ? 1 : s.dragging ? s.attraction : 0;
      flap.current.rotation.x = damp(flap.current.rotation.x, -open * 1.2, 12, Math.min(dt, 0.05));
    }
  });
  const status = useApp((s) => (s.insertedTapeId ? (s.deck === 'reading' ? 'LOAD' : 'PLAY') : '12:00'));
  return (
    <group>
      <RoundedBox args={[VCR.w, VCR.h, VCR.d]} radius={0.01} smoothness={2} position={[VCR.x, VCR.y, VCR.z]} castShadow receiveShadow material={mat('#2a2826', { roughness: 0.5, metalness: 0.2 })} />
      <mesh position={[VCR.x, VCR.y, VCR.front + 0.001]} material={mat('#3a3734', { roughness: 0.45, metalness: 0.25 })}>
        <planeGeometry args={[VCR.w - 0.02, VCR.h - 0.02]} />
      </mesh>
      {/* slot and its spring flap */}
      <mesh position={[SLOT.x, SLOT.y, SLOT.z]} material={mat('#0e0d0c')}>
        <planeGeometry args={[0.32, 0.045]} />
      </mesh>
      <group position={[SLOT.x, SLOT.y + 0.022, SLOT.z + 0.002]}>
        <group ref={flap}>
          <mesh position={[0, -0.022, 0]} material={mat('#24221f', { roughness: 0.4, metalness: 0.3 })}>
            <boxGeometry args={[0.31, 0.042, 0.004]} />
          </mesh>
        </group>
      </group>
      {/* display */}
      <mesh position={[VCR.x + 0.2, VCR.y + 0.01, VCR.front + 0.002]} material={mat('#121a16')}>
        <planeGeometry args={[0.15, 0.05]} />
      </mesh>
      <Text font={FONT_MONO} fontSize={0.03} color="#7fe0b4" position={[VCR.x + 0.2, VCR.y + 0.008, VCR.front + 0.004]} anchorX="center" anchorY="middle">
        {status}
      </Text>
    </group>
  );
}

function SideTable() {
  const { x, z, w, h, d } = TABLE;
  const wood = mat(PAL.woodLight, { roughness: 0.65 });
  return (
    <group>
      <RoundedBox args={[w, 0.04, d]} radius={0.01} smoothness={2} position={[x, h - 0.02, z]} castShadow receiveShadow material={wood} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[x + sx * (w / 2 - 0.05), (h - 0.04) / 2, z + sz * (d / 2 - 0.05)]} castShadow material={mat(PAL.woodDark)}>
          <boxGeometry args={[0.035, h - 0.04, 0.035]} />
        </mesh>
      ))}
    </group>
  );
}

function Printer() {
  const lamp = useRef();
  useFrame(({ clock }, dt) => {
    const s = useApp.getState();
    if (!lamp.current) return;
    const target = s.printing ? 1.6 + (s.reducedMotion ? 0 : Math.sin(clock.elapsedTime * 6) * 0.6) : 0.25;
    lamp.current.emissiveIntensity = damp(lamp.current.emissiveIntensity, target, 10, Math.min(dt, 0.05));
  });
  return (
    <group>
      <RoundedBox args={[PRINTER.w, PRINTER.h, PRINTER.d]} radius={0.04} smoothness={3} position={[PRINTER.x, PRINTER.y, PRINTER.z]} castShadow receiveShadow material={mat('#e6dfd2', { roughness: 0.45 })} />
      <mesh position={[PRINTER.x, PRINTER.slotY, PRINTER.front + 0.002]} material={mat('#1b1916')}>
        <planeGeometry args={[0.36, 0.022]} />
      </mesh>
      <mesh position={[PRINTER.x + 0.17, PRINTER.y + 0.08, PRINTER.front + 0.002]}>
        <circleGeometry args={[0.009, 12]} />
        <meshStandardMaterial ref={lamp} color="#7fe0b4" emissive="#7fe0b4" emissiveIntensity={0.25} toneMapped={false} />
      </mesh>
      <Text font={FONT_SERIF} fontSize={0.022} letterSpacing={0.2} color="#6a6157" position={[PRINTER.x - 0.12, PRINTER.y + 0.08, PRINTER.front + 0.002]} anchorX="center">
        PRINTS
      </Text>
    </group>
  );
}

function Tray() {
  const handlers = hoverHandlers({ title: 'Photo tray', actions: [['click', 'Open album']] }, inRoom);
  return (
    <group position={[TRAY.x, TRAY.y, TRAY.z]}>
      <mesh position={[0, 0.004, 0]} receiveShadow material={mat('#5c3d28', { roughness: 0.7 })}>
        <boxGeometry args={[TRAY.w, 0.008, TRAY.d]} />
      </mesh>
      {[[0, TRAY.d / 2, TRAY.w, 0.012], [0, -TRAY.d / 2, TRAY.w, 0.012], [TRAY.w / 2, 0, 0.012, TRAY.d], [-TRAY.w / 2, 0, 0.012, TRAY.d]].map(([px, pz, sx, sz], i) => (
        <mesh key={i} position={[px, 0.022, pz]} castShadow material={mat('#5c3d28')}>
          <boxGeometry args={[sx, 0.036, sz]} />
        </mesh>
      ))}
      <mesh
        position={[0, 0.002, 0]}
        {...handlers}
        onClick={(e) => {
          if (!inRoom()) return;
          e.stopPropagation();
          useApp.getState().setAlbumOpen(true);
        }}
      >
        <boxGeometry args={[TRAY.w, 0.004, TRAY.d]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
  );
}
