import { useEffect, useState } from 'react';

const MS_PER_CHAR = 18;
const MAX_DURATION_MS = 2400;

// Reveals `text` progressively. Long replies speed up so nothing takes longer than ~2.4s.
export function useTypewriter(text, enabled) {
  const [count, setCount] = useState(enabled ? 0 : text.length);

  useEffect(() => {
    if (!enabled) return;
    const start = performance.now();
    const duration = Math.min(text.length * MS_PER_CHAR, MAX_DURATION_MS);
    let frame = 0;

    const tick = (now) => {
      const next = Math.min(text.length, Math.ceil(((now - start) / duration) * text.length));
      setCount(next);
      if (next < text.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, enabled]);

  const visible = enabled ? count : text.length;
  return { text: text.slice(0, visible), done: visible >= text.length };
}
