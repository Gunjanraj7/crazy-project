import { cn } from '@/lib/cn';

const initialsOf = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

// User "avatar": initials inside a neon hexagon.
export default function HexInitials({ name, className }) {
  return (
    <div
      aria-hidden="true"
      className={cn('relative flex aspect-square shrink-0 items-center justify-center bg-linear-to-br from-purple-500 to-neon-teal p-px', className)}
      style={{ clipPath: 'polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0 50%)' }}
    >
      <div
        className="flex h-full w-full items-center justify-center bg-night-800 font-display font-bold text-white"
        style={{ clipPath: 'polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0 50%)' }}
      >
        {initialsOf(name)}
      </div>
    </div>
  );
}
