/** The mark: a three-frame photostrip, the middle frame lit. */
export function Logo({ size = 40, className = 'logo' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <rect x="12.5" y="3" width="15" height="34" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="15.5" y="6.5" width="9" height="7" fill="currentColor" />
      <rect x="15.5" y="16.5" width="9" height="7" fill="var(--terracotta)" />
      <rect x="15.5" y="26.5" width="9" height="7" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ as: Tag = 'span', className = '', id }) {
  return (
    <Tag className={`wordmark ${className}`} id={id}>
      PLAYBOOTH
    </Tag>
  );
}
