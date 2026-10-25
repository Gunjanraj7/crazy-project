import { useEffect, useState } from 'react';

// Tracks the pointer in viewport pixels, throttled to one update per animation frame.
// Only components that call this hook re-render on movement, so keep it close to where it's used.
export function useMousePosition() {
  const [position, setPosition] = useState(() => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  }));

  useEffect(() => {
    let frame = 0;

    const handlePointerMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setPosition({ x: e.clientX, y: e.clientY }));
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return position;
}
