/** The maker's credit, shared by the booth and the Video.js showcase. */
export const MAKER = { handle: '@ruffasakay', url: 'https://contra.com/ruffasakay' };
/** The source, open under the Apache License 2.0. */
export const REPO = 'https://github.com/ruffasakay/playbooth';

export function Credit({ className = '' }) {
  return (
    <p className={`credit ${className}`}>
      Made with
      <svg className="credit-heart" viewBox="0 0 24 24" width="1em" height="1em" role="img" aria-label="love">
        <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.6 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.9 1.3-1.8 2.9-2.9 4.9-2.9 3.5 0 5.7 3.5 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z" fill="currentColor" />
      </svg>
      by{' '}
      <a href={MAKER.url} target="_blank" rel="noopener noreferrer" data-tip="Open Contra profile">
        {MAKER.handle}
      </a>
    </p>
  );
}
