import { CircleAlert, Info } from 'lucide-react';
import { cn } from '@/lib/cn';

const VARIANTS = {
  error: { icon: CircleAlert, className: 'border-rose-500/30 bg-rose-500/10 text-rose-300' },
  info: { icon: Info, className: 'border-sky-500/30 bg-sky-500/10 text-sky-300' },
};

export default function Alert({ variant = 'info', children }) {
  const { icon: Icon, className } = VARIANTS[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('flex animate-fade-up items-start gap-2.5 rounded-xl border px-4 py-3 text-sm', className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
