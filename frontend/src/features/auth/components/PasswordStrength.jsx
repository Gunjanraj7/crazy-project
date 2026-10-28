import { cn } from '@/lib/cn';
import { getPasswordStrength } from '../utils/validators';

const LEVELS = [
  { label: 'Too weak', color: 'bg-rose-500', text: 'text-rose-400' },
  { label: 'Weak', color: 'bg-orange-500', text: 'text-orange-400' },
  { label: 'Fair', color: 'bg-yellow-400', text: 'text-yellow-300' },
  { label: 'Good', color: 'bg-teal-400', text: 'text-teal-300' },
  { label: 'Strong', color: 'bg-emerald-400', text: 'text-emerald-300' },
];

export default function PasswordStrength({ password }) {
  if (!password) return null;
  const score = getPasswordStrength(password);
  const level = LEVELS[score];

  return (
    <div className="-mt-2 flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4].map((step) => (
          <span key={step} className={cn('h-1 flex-1 rounded-full transition-colors', step <= score ? level.color : 'bg-gray-800')} />
        ))}
      </div>
      <span className={cn('w-16 text-right font-mono text-[10px] tracking-wider uppercase', level.text)}>{level.label}</span>
    </div>
  );
}
