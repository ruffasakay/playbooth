import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Hover hints, like a game's key prompts: rest the mouse on a control and a
 * small card names it with its keyboard key ("Snap  S"). Nothing shows on
 * touch screens or until the pointer settles, so the screen stays clean.
 * Controls opt in with data-tip (the name) and data-key (space-separated keys).
 */
export function Hint() {
  const [hint, setHint] = useState(null);
  const [host, setHost] = useState(() => (typeof document !== 'undefined' ? document.body : null));

  // in full screen only the full-screen element is drawn, so the card moves inside it
  useEffect(() => {
    const on = () => setHost(document.fullscreenElement ?? document.webkitFullscreenElement ?? document.body);
    document.addEventListener('fullscreenchange', on);
    document.addEventListener('webkitfullscreenchange', on);
    return () => {
      document.removeEventListener('fullscreenchange', on);
      document.removeEventListener('webkitfullscreenchange', on);
    };
  }, []);

  useEffect(() => {
    let timer = 0;
    let current = null;
    const hide = () => {
      clearTimeout(timer);
      current = null;
      setHint(null);
    };
    const over = (e) => {
      // a mouse only: touch and pen never get hover cards
      if (e.pointerType !== 'mouse') return;
      const el = e.target.closest?.('[data-tip]');
      if (el === current) return;
      hide();
      current = el;
      if (!el || el.closest('[inert], [data-hidden]')) return;
      timer = setTimeout(() => {
        if (!el.isConnected || el.getAttribute('aria-expanded') === 'true') return;
        const rot = el.closest('[data-rotate]');
        if (rot) return; // a turned player has no mouse to hover with
        // a menu is open in the player: no card on top of it
        const dock = el.closest('.pb-dock, .pb-rail');
        if (dock && dock.closest('.pb-skin')?.querySelector('.pb-pop')) return;
        const k = el.getBoundingClientRect();
        const side = el.closest('[data-tip-side]')?.dataset.tipSide || (k.bottom > innerHeight - 120 ? 'top' : k.left + k.width / 2 > innerWidth / 2 ? 'left' : 'right');
        // inside a dock the card stands outside the whole dock, level with the key, so it never covers the progress or a neighbour
        let r = k;
        if (dock) {
          const d = dock.getBoundingClientRect();
          r = side === 'left' ? { left: d.left, right: k.right, top: k.top, bottom: k.bottom, width: k.right - d.left, height: k.height }
            : side === 'right' ? { left: k.left, right: d.right, top: k.top, bottom: k.bottom, width: d.right - k.left, height: k.height }
            : side === 'top' ? { left: k.left, right: k.right, top: d.top, bottom: k.bottom, width: k.width, height: k.bottom - d.top }
            : { left: k.left, right: k.right, top: k.top, bottom: d.bottom, width: k.width, height: d.bottom - k.top };
        }
        setHint({ text: el.dataset.tip, keys: (el.dataset.key || '').split(' ').filter(Boolean), r, side });
      }, 380);
    };
    document.addEventListener('pointerover', over);
    document.addEventListener('pointerdown', hide, true);
    document.addEventListener('click', hide, true);
    document.addEventListener('keydown', hide, true);
    window.addEventListener('blur', hide);
    window.addEventListener('scroll', hide, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointerdown', hide, true);
      document.removeEventListener('click', hide, true);
      document.removeEventListener('keydown', hide, true);
      window.removeEventListener('blur', hide);
      window.removeEventListener('scroll', hide, true);
    };
  }, []);

  if (!hint || !host) return null;
  const { r, side } = hint;
  const gap = 10;
  const style =
    side === 'left'
      ? { right: innerWidth - r.left + gap, top: r.top + r.height / 2, translate: '0 -50%' }
      : side === 'right'
        ? { left: r.right + gap, top: r.top + r.height / 2, translate: '0 -50%' }
        : side === 'bottom'
          ? { left: r.left + r.width / 2, top: r.bottom + gap, translate: '-50% 0' }
          : { left: r.left + r.width / 2, bottom: innerHeight - r.top + gap, translate: '-50% 0' };
  return createPortal(
    <div className="hint" data-side={side} style={style} aria-hidden="true">
      <span>{hint.text}</span>
      {hint.keys.map((k) => (
        <kbd key={k}>{k}</kbd>
      ))}
    </div>,
    host,
  );
}
