import { useMousePosition } from '@/hooks/useMousePosition';

// Soft light that follows the mouse. Hidden on touch screens where there's no cursor.
export default function CursorGlow({ dimmed = false }) {
  const { x, y } = useMousePosition();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-50 hidden h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen transition-opacity duration-300 pointer-fine:block"
      style={{
        left: x,
        top: y,
        opacity: dimmed ? 0.3 : 1,
        background:
          'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(45, 212, 191, 0.05) 40%, transparent 70%)',
      }}
    />
  );
}
