/**
 * Fine line icons on a 24-unit grid: 1.7 strokes, round joins.
 * The play triangle is nudged right of center so it reads as centered.
 */
const base = { width: 24, height: 24, viewBox: '0 0 24 24', 'aria-hidden': true, focusable: false, className: 'icon' };
const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const Play = () => (
  <svg {...base}><path d="M8.2 5.6v12.8c0 .7.8 1.1 1.4.7l9.4-6.4c.5-.4.5-1.1 0-1.4L9.6 4.9c-.6-.4-1.4 0-1.4.7Z" fill="currentColor" /></svg>
);
export const Pause = () => (
  <svg {...base}><rect x="6.5" y="5" width="3.6" height="14" rx="1" fill="currentColor" /><rect x="13.9" y="5" width="3.6" height="14" rx="1" fill="currentColor" /></svg>
);
export const Replay = () => (
  <svg {...base}><path {...line} d="M4.6 12a7.4 7.4 0 1 0 2.2-5.3" /><path {...line} d="M4.4 4.2v3.6H8" /></svg>
);
/** Circular arrow with the step written inside, like a remote's skip key. */
export const Seek = ({ back }) => (
  <svg {...base}>
    <g transform={back ? 'translate(24 0) scale(-1 1)' : undefined}>
      <path {...line} d="M12 4.2a7.8 7.8 0 1 1-7.1 4.6" />
      <path {...line} d="M12 1.8l2.6 2.4L12 6.6" />
    </g>
    <text x="12" y="15.4" textAnchor="middle" fontSize="7.4" fontFamily="'DM Mono', monospace" fontWeight="500" fill="currentColor">10</text>
  </svg>
);
export const Volume = ({ level = 'high' }) => (
  <svg {...base}>
    <path d="M4 9.6c0-.5.4-.9.9-.9h2.6l4-3.2c.6-.5 1.5-.1 1.5.7v11.6c0 .8-.9 1.2-1.5.7l-4-3.2H4.9c-.5 0-.9-.4-.9-.9V9.6Z" fill="currentColor" />
    {level === 'off' ? <path {...line} d="m16.4 9.6 4.4 4.8m0-4.8-4.4 4.8" /> : <path {...line} d="M16.2 9.4a3.7 3.7 0 0 1 0 5.2" />}
    {level === 'high' && <path {...line} d="M18.7 6.9a7.3 7.3 0 0 1 0 10.2" />}
  </svg>
);
export const Captions = ({ on }) => (
  <svg {...base}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.4" {...line} fill={on ? 'currentColor' : 'none'} />
    <path d="M10.2 10.5a2 2 0 1 0 0 3M16.2 10.5a2 2 0 1 0 0 3" fill="none" stroke={on ? 'var(--bar-bg, #1e1610)' : 'currentColor'} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
export const Pip = () => (
  <svg {...base}><rect x="3" y="5" width="18" height="14" rx="2" {...line} /><rect x="12" y="11.5" width="7" height="5" rx="1" fill="currentColor" /></svg>
);
export const Fullscreen = ({ exit }) => (
  <svg {...base}>{exit ? <path {...line} d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path {...line} d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}</svg>
);
export const Camera = () => (
  <svg {...base}><path {...line} d="M4 8.2c0-.9.7-1.6 1.6-1.6h2.2l1.4-2h5.6l1.4 2h2.2c.9 0 1.6.7 1.6 1.6v9.2c0 .9-.7 1.6-1.6 1.6H5.6c-.9 0-1.6-.7-1.6-1.6V8.2Z" /><circle cx="12" cy="12.6" r="3.4" {...line} /></svg>
);
export const Album = () => (
  <svg {...base}><rect x="7" y="3.5" width="13" height="13" rx="1.4" {...line} /><path {...line} d="M4 7.5v11c0 1.1.9 2 2 2h11" /><path {...line} d="m9.6 13.4 2.6-3 2 2 1.4-1.4 2.2 2.4" /></svg>
);
export const Print = () => (
  <svg {...base}><path {...line} d="M7 8V3.6h10V8" /><rect x="3.5" y="8" width="17" height="8.4" rx="1.6" {...line} /><path {...line} d="M7 13.6h10v6.8H7z" /></svg>
);
export const Eject = () => (
  <svg {...base}><path d="M11.2 5.2c.4-.5 1.2-.5 1.6 0l5.4 6.4c.5.6.1 1.4-.8 1.4H6.6c-.9 0-1.3-.8-.8-1.4l5.4-6.4Z" fill="currentColor" /><rect x="5.6" y="15.4" width="12.8" height="2.6" rx="0.8" fill="currentColor" /></svg>
);
export const Back = () => (
  <svg {...base}><path {...line} d="M15 5.5 8.5 12l6.5 6.5" /></svg>
);

/** A small stack of snaps. */
export const Stack = () => (
  <svg {...base}><rect x="6.5" y="6.5" width="13" height="11" rx="1.2" {...line} /><path {...line} d="M4 15V5.2C4 4.5 4.5 4 5.2 4H16" /><path {...line} d="m9 14.6 2.4-2.7 1.8 1.8 1.3-1.3 2 2.2" /></svg>
);
export const TextStyle = () => (
  <svg {...base}><path {...line} d="M4 18 9 6l5 12M5.8 14h6.4" /><path {...line} d="M15.5 12.4c.5-.9 1.4-1.4 2.5-1.4 1.6 0 2.5.9 2.5 2.5V18m0-3.2c-.5-.3-1.3-.5-2.2-.5-1.4 0-2.5.6-2.5 1.8 0 1.1.9 1.9 2.1 1.9 1.2 0 2.1-.6 2.6-1.4" /></svg>
);
/** Three dots: speed, skip and picture in picture live behind it. */
export const More = () => (
  <svg {...base}><circle cx="5.6" cy="12" r="1.8" fill="currentColor" /><circle cx="12" cy="12" r="1.8" fill="currentColor" /><circle cx="18.4" cy="12" r="1.8" fill="currentColor" /></svg>
);
