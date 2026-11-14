import { useEffect, useRef } from 'react';
import { useApp } from '../store.js';

/**
 * A round cursor that says what a press will do: "View" over a tape, "Drag"
 * while you hold one, "Play" over the picture, "Snap" over the camera key.
 * Elements name their verb with data-cursor; anything else clickable gets a
 * short word from its own label. Mouse and trackpad only: touch keeps the
 * system's behavior, and the native cursor comes back if this fails.
 */
const INTERACTIVE = '[data-cursor], button, a[href], [role="button"], [role="radio"], [role="switch"], [role="slider"], [role="menuitem"], label, input, select, summary';

function wordFor(el) {
  if (el.matches('[role="slider"], input[type="range"]')) return 'Drag';
  if (el.matches('input[type="color"], label.pb-swatch')) return 'Color';
  const text = (el.getAttribute('aria-label') || el.textContent || '').trim();
  const first = text.split(/[\s,.:;!?]+/)[0] || '';
  if (first && first.length <= 7 && /^[\p{L}+−-]/u.test(first)) return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  return 'Open';
}

export function Cursor() {
  const ref = useRef(null);
  useEffect(() => {
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    if (!fine.matches || !ref.current) return undefined;
    const el = ref.current;
    const label = el.firstChild;
    const root = document.documentElement;
    root.classList.add('has-cursor');
    let target = null;
    let down = false;
    let shown = false;

    const decide = () => {
      const s = useApp.getState();
      let text = '';
      let hide = false;
      if (s.dragging) text = 'Drag';
      else if (target && target.isConnected) {
        if (target.closest('.pb-skin[data-idle]') && !target.closest('.pb-dock, .pb-rail')) hide = true;
        const hit = target.closest(INTERACTIVE);
        if (hit && !hit.closest('[inert]')) {
          if (hit.hasAttribute('data-cursor')) text = hit.getAttribute('data-cursor');
          else if (!hit.disabled && hit.getAttribute('aria-disabled') !== 'true') text = wordFor(hit);
        } else if (target.closest('.stage')) {
          if (s.hover) text = s.hover.cursor || 'View';
          else if (down && s.phase === 'inside') text = 'Look';
        }
      }
      text = text.slice(0, 7);
      if (label.textContent !== text) label.textContent = text;
      el.dataset.mode = text ? 'label' : 'dot';
      if (hide || !shown) el.dataset.hidden = '';
      else delete el.dataset.hidden;
    };

    const move = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      shown = true;
      target = e.target;
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      decide();
    };
    const press = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      down = true;
      el.dataset.down = '';
      decide();
    };
    const release = () => {
      down = false;
      delete el.dataset.down;
      requestAnimationFrame(decide);
    };
    const leave = (e) => {
      if (!e.relatedTarget) {
        shown = false;
        decide();
      }
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', press, { passive: true });
    window.addEventListener('pointerup', release, { passive: true });
    document.addEventListener('mouseout', leave);
    // labels that change under a resting pointer (Play becomes Pause) and 3D hovers
    const tick = setInterval(decide, 250);
    const unsub = useApp.subscribe((s, p) => {
      if (s.hover !== p.hover || s.dragging !== p.dragging) decide();
    });
    return () => {
      root.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      document.removeEventListener('mouseout', leave);
      clearInterval(tick);
      unsub();
    };
  }, []);
  return (
    <div ref={ref} className="cursor" data-mode="dot" data-hidden="" aria-hidden="true">
      <span className="cursor-label" />
    </div>
  );
}
