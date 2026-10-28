import { useId } from 'react';
import { Link } from 'react-router';
import { APP_NAME } from '@/config/app';
import { cn } from '@/lib/cn';

// Hex mark + wordmark. The "//" in the name is highlighted in neon.
export default function Logo({ to = '/', compact = false, className }) {
  const [first, second] = APP_NAME.split('//');
  // Unique per instance: a duplicate id would point at a gradient that may sit in a hidden (display:none) copy.
  const gradientId = `logo-gradient-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <Link
      to={to}
      className={cn('group inline-flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-purple-400', className)}
    >
      <svg viewBox="0 0 64 64" className="h-8 w-8 shrink-0 transition-transform duration-500 group-hover:rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        <polygon points="32,6 54,19 54,45 32,58 10,45 10,19" fill="none" stroke={`url(#${gradientId})`} strokeWidth="4" strokeLinejoin="round" />
        <polygon points="32,20 42,26 42,38 32,44 22,38 22,26" fill={`url(#${gradientId})`} />
      </svg>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-wider text-white">
          {first}
          <span className="text-neon-pink">//</span>
          {second}
        </span>
      )}
    </Link>
  );
}
