import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

const VARIANTS = {
  primary:
    'bg-linear-to-r from-purple-600 to-neon-teal text-white shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:shadow-[0_0_28px_rgba(139,92,246,0.45)]',
  secondary:
    'border border-gray-800 bg-night-700/60 text-gray-200 hover:border-gray-700 hover:bg-night-700',
};

export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {/* Light sweep on hover */}
      {variant === 'primary' && (
        <span className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 ease-in-out group-hover:translate-y-0 group-disabled:hidden" />
      )}
      {loading && <LoaderCircle className="relative h-4 w-4 animate-spin" aria-hidden="true" />}
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  );
}
