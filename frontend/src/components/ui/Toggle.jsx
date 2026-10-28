import { useId } from 'react';
import { cn } from '@/lib/cn';

// On/off switch with a label and optional description.
export default function Toggle({ label, description, checked, onChange }) {
  const labelId = useId();

  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div>
        <p id={labelId} className="text-sm font-medium text-gray-200">
          {label}
        </p>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400',
          checked ? 'border-transparent bg-linear-to-r from-purple-600 to-neon-teal' : 'border-gray-700 bg-night-700',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  );
}
