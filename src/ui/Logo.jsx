/** The booth badge: a little photobooth with its curtain drawn. */
export function Logo({ size = 56, title }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title} className="logo">
      <rect x="6" y="12" width="52" height="46" rx="12" fill="var(--butter)" />
      <rect x="4" y="5" width="56" height="15" rx="7.5" fill="var(--cherry)" />
      <circle cx="13" cy="12.5" r="2" fill="var(--butter-light)" />
      <circle cx="22" cy="12.5" r="2" fill="var(--butter-light)" />
      <circle cx="42" cy="12.5" r="2" fill="var(--butter-light)" />
      <circle cx="51" cy="12.5" r="2" fill="var(--butter-light)" />
      <rect x="20" y="25" width="24" height="33" rx="3" fill="var(--ink)" />
      <path d="M20 25h11c-1 9-4 21-8 33h-3zM44 25H33c1 9 4 21 8 33h3z" fill="var(--cherry)" />
      <rect x="18" y="23" width="28" height="4" rx="2" fill="var(--walnut)" />
    </svg>
  );
}
