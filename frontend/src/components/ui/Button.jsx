import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

// Primary buttons use the cut-corner shape. clip-path hides outlines, so focus is shown with an inset ring.
const VARIANTS = {
  primary:
    'clip-chamfer bg-linear-to-r from-purple-600 via-fuchsia-600 to-neon-teal bg-size-[200%_100%] bg-left text-white hover:bg-right focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-inset',
  secondary:
    'rounded-xl border border-gray-800 bg-night-700/60 text-gray-200 hover:border-gray-600 hover:bg-night-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400',
  ghost:
    'rounded-xl text-gray-400 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400',
  danger:
    'rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:border-rose-400 hover:bg-rose-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400',
};

// Renders a <button> by default; pass `as={Link}` (plus `to`) for a link that looks like a button.
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  block = true,
  className,
  children,
  ...props
}) {
  return (
    <Component
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden px-4 whitespace-nowrap py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-hidden',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100',
        block && 'w-full',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {loading && <LoaderCircle className="relative h-4 w-4 animate-spin" aria-hidden="true" />}
      <span className="relative flex items-center gap-2">{children}</span>
    </Component>
  );
}
