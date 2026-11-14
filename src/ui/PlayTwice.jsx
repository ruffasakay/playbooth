/**
 * The "Play ×2" emblem: a cassette standing in front of a disc. The tape is
 * play as in a game (you pick it up and put it in), the disc is play as in a
 * film. The cassette wears the booth's mark on its label; its reels turn
 * slowly unless calm motion is asked for.
 */
export function PlayTwice({ size = 120, className = '' }) {
  return (
    <svg className={`play2 ${className}`} viewBox="0 0 160 140" width={size} height={(size * 140) / 160} role="img" aria-label="Play twice: a cassette and a disc">
      <defs>
        <linearGradient id="p2-disc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6efe2" />
          <stop offset="0.28" stopColor="#d9c9f0" />
          <stop offset="0.5" stopColor="#bfe3dc" />
          <stop offset="0.72" stopColor="#f4d6b0" />
          <stop offset="1" stopColor="#e8b9c4" />
        </linearGradient>
        <radialGradient id="p2-shine" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="p2-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf5ea" />
          <stop offset="1" stopColor="#eadfca" />
        </linearGradient>
      </defs>

      {/* the disc, behind */}
      <g transform="translate(104 50)">
        <circle r="44" fill="url(#p2-disc)" />
        {[38, 32, 26].map((r) => (
          <circle key={r} r={r} fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="0.8" />
        ))}
        <circle r="44" fill="url(#p2-shine)" />
        <circle r="14" fill="#f6efe2" stroke="#33261c" strokeOpacity="0.15" />
        <circle r="6" fill="#33261c" />
        <circle r="44" fill="none" stroke="#33261c" strokeOpacity="0.18" strokeWidth="1.2" />
      </g>

      {/* the cassette, tilted toward you, with depth on its bottom and right */}
      <g transform="translate(14 46) rotate(-7)">
        <path d="M6 0h96a6 6 0 0 1 6 6v58a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6Z" transform="translate(5 6)" fill="#3a2b20" opacity="0.28" />
        <path d="M108 6v58a6 6 0 0 1-6 6H6l5 6h96a6 6 0 0 0 6-6V12Z" fill="#c9b99c" />
        <rect width="108" height="70" rx="6" fill="url(#p2-front)" stroke="#33261c" strokeOpacity="0.2" />
        {/* label with the mark */}
        <rect x="7" y="6" width="94" height="17" rx="3" fill="#9e4330" />
        <g transform="translate(13 8.5)">
          <rect x="0" y="0" width="6" height="12" rx="0.8" fill="none" stroke="#fff8ef" strokeWidth="1.1" />
          <rect x="1.6" y="1.4" width="2.8" height="2.4" fill="#fff8ef" />
          <rect x="1.6" y="4.8" width="2.8" height="2.4" fill="#f4d35e" />
          <rect x="1.6" y="8.2" width="2.8" height="2.4" fill="#fff8ef" />
        </g>
        <text x="58" y="18.6" textAnchor="middle" fill="#fff8ef" fontFamily="'Fraunces Variable', Fraunces, Georgia, serif" fontWeight="600" fontSize="10.5" letterSpacing="1.2">
          PLAY ×2
        </text>
        {/* window and reels */}
        <rect x="22" y="29" width="64" height="23" rx="11.5" fill="#2a211b" />
        {[38, 70].map((cx) => (
          <g key={cx} transform={`translate(${cx} 40.5)`}>
            <circle r="9" fill="#f6efe2" />
            <g className="play2-reel">
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <rect key={a} x="-1.3" y="-8" width="2.6" height="4.2" rx="1" fill="#2a211b" transform={`rotate(${a})`} />
              ))}
            </g>
            <circle r="2.6" fill="#2a211b" />
          </g>
        ))}
        <rect x="46" y="35" width="16" height="11" rx="1.5" fill="#6b5446" opacity="0.65" />
        {/* the bottom bridge */}
        <path d="M28 70l5-10h42l5 10Z" fill="#e2d5bd" stroke="#33261c" strokeOpacity="0.15" />
        {[38, 70].map((x) => (
          <circle key={x} cx={x} cy="65" r="2" fill="#33261c" opacity="0.35" />
        ))}
      </g>
    </svg>
  );
}
