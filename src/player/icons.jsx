/**
 * PLAYBOOTH icons: chunky, rounded, drawn on a 24-unit grid.
 * Filled shapes for the primary keys, 2.4-unit strokes for the rest.
 * The play triangle sits 1 unit right of geometric center so it looks
 * centered next to pause (optical, not geometric, centering).
 */
const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  focusable: false,
  className: 'icon',
};
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const IconPlay = () => (
  <svg {...base}>
    <path d="M8.6 5.4c0-1.1 1.2-1.8 2.2-1.2l9 6.3c.9.6.9 1.9 0 2.5l-9 6.3c-1 .6-2.2-.1-2.2-1.2V5.4Z" fill="currentColor" transform="translate(-1.6 0)" />
  </svg>
);

export const IconPause = () => (
  <svg {...base}>
    <rect x="5.5" y="4.5" width="4.6" height="15" rx="1.8" fill="currentColor" />
    <rect x="13.9" y="4.5" width="4.6" height="15" rx="1.8" fill="currentColor" />
  </svg>
);

export const IconReplay = () => (
  <svg {...base}>
    <path {...stroke} d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" />
    <path d="M4 3.8v4.6h4.6" {...stroke} />
  </svg>
);

const SeekGlyph = ({ forward }) => (
  <svg {...base} style={forward ? undefined : { transform: 'scaleX(-1)' }}>
    <path {...stroke} d="M12 4.6a7.6 7.6 0 1 1-6.9 4.4" />
    <path {...stroke} d="M12 1.9 15 4.6 12 7.3" />
  </svg>
);
export const IconBack = () => <SeekGlyph forward={false} />;
export const IconForward = () => <SeekGlyph forward />;

export const IconVolume = ({ level = 'high' }) => (
  <svg {...base}>
    <path d="M3.6 9.4c0-.7.5-1.2 1.2-1.2h2.6l4.1-3.4c.8-.7 2-.1 2 1v12.4c0 1.1-1.2 1.7-2 1l-4.1-3.4H4.8c-.7 0-1.2-.5-1.2-1.2V9.4Z" fill="currentColor" />
    {level === 'off' ? (
      <path {...stroke} d="m16.5 9.5 5 5m0-5-5 5" />
    ) : (
      <>
        <path {...stroke} d="M16.4 9.2a3.9 3.9 0 0 1 0 5.6" />
        {level !== 'low' && <path {...stroke} d="M19 6.6a7.6 7.6 0 0 1 0 10.8" />}
      </>
    )}
  </svg>
);

export const IconCaptions = ({ on }) => (
  <svg {...base}>
    <rect x="2.8" y="5" width="18.4" height="14" rx="3.6" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.4" />
    <path
      d="M10.4 10.3a2.2 2.2 0 1 0 0 3.4M17 10.3a2.2 2.2 0 1 0 0 3.4"
      fill="none"
      stroke={on ? 'var(--key-face, #fff7e8)' : 'currentColor'}
      strokeWidth="2.1"
      strokeLinecap="round"
    />
  </svg>
);

export const IconFullscreen = ({ exit }) => (
  <svg {...base}>
    {exit ? (
      <path {...stroke} d="M9 3.8V9H3.8M15 3.8V9h5.2M9 20.2V15H3.8M15 20.2V15h5.2" />
    ) : (
      <path {...stroke} d="M3.8 9V3.8H9M20.2 9V3.8H15M3.8 15v5.2H9M20.2 15v5.2H15" />
    )}
  </svg>
);

export const IconSnap = () => (
  <svg {...base}>
    <path d="M8.2 5.6 9.3 4c.3-.4.7-.6 1.2-.6h3c.5 0 .9.2 1.2.6l1.1 1.6h2.6c1.4 0 2.6 1.2 2.6 2.6v8.6c0 1.4-1.2 2.6-2.6 2.6H5.6C4.2 19.4 3 18.2 3 16.8V8.2c0-1.4 1.2-2.6 2.6-2.6h2.6Z" fill="currentColor" />
    <circle cx="12" cy="12.4" r="3.6" fill="var(--key-face, #fff7e8)" />
    <circle cx="12" cy="12.4" r="1.7" fill="currentColor" />
  </svg>
);

export const IconAlbum = () => (
  <svg {...base}>
    <rect x="6.6" y="3" width="14.4" height="12.2" rx="2.2" fill="none" stroke="currentColor" strokeWidth="2.4" />
    <path d="M3 8.6v10c0 1.3 1.1 2.4 2.4 2.4h11" {...stroke} />
    <path d="m9.6 13 3-3.4 2.4 2.4 1.6-1.6 2.6 2.6" {...stroke} strokeWidth="2" />
  </svg>
);

export const IconPrint = () => (
  <svg {...base}>
    <path {...stroke} d="M7 8.6V3.6h10v5" />
    <path d="M4.6 8.4h14.8c1 0 1.8.8 1.8 1.8v5.6c0 1-.8 1.8-1.8 1.8H17v-3.2H7v3.2H4.6c-1 0-1.8-.8-1.8-1.8v-5.6c0-1 .8-1.8 1.8-1.8Z" fill="currentColor" />
    <path {...stroke} d="M7 14.4h10v6H7z" />
  </svg>
);

export const IconEject = () => (
  <svg {...base}>
    <path d="M10.9 4.4c.6-.8 1.6-.8 2.2 0l5.6 7.2c.6.8 0 1.9-1 1.9H6.3c-1 0-1.6-1.1-1-1.9l5.6-7.2Z" fill="currentColor" />
    <rect x="5" y="16" width="14" height="3.6" rx="1.4" fill="currentColor" />
  </svg>
);

/** Stand up from the seat and look around the booth again. */
export const IconRoom = () => (
  <svg {...base}>
    <path {...stroke} d="M3.6 20.4V8.2L12 3.6l8.4 4.6v12.2" />
    <path d="M8.6 20.4v-7.6c0-.9.7-1.6 1.6-1.6h3.6c.9 0 1.6.7 1.6 1.6v7.6" {...stroke} />
    <path {...stroke} d="M12 11.4v9" />
  </svg>
);

export const IconSpeed = () => (
  <svg {...base}>
    <path {...stroke} d="M4.4 17.4a8.6 8.6 0 1 1 15.2 0" />
    <path {...stroke} d="m12 13.2 3.6-4.4" />
  </svg>
);
