import { useId } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

// Labelled text input with an optional leading icon, trailing slot (e.g. a show/hide button),
// helper hint and validation error, all wired up with the right aria attributes.
export default function InputField({
  label,
  icon: Icon,
  error,
  hint,
  trailing,
  labelAction,
  id,
  ref,
  ...inputProps
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        {labelAction}
      </div>

      <div className="group relative">
        {Icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Icon
              aria-hidden="true"
              className={cn(
                'h-5 w-5 transition-colors',
                error ? 'text-rose-400' : 'text-gray-500 group-focus-within:text-purple-400',
              )}
            />
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full rounded-xl border bg-night-700 py-3 text-white shadow-inner transition-all placeholder:text-gray-500',
            'focus:outline-hidden focus:ring-1 read-only:opacity-70',
            Icon ? 'pl-12' : 'pl-4',
            trailing ? 'pr-12' : 'pr-4',
            error
              ? 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500'
              : 'border-gray-800 hover:border-gray-700 focus:border-purple-500 focus:ring-purple-500',
          )}
          {...inputProps}
        />

        {trailing && <div className="absolute inset-y-0 right-0 flex items-center pr-2">{trailing}</div>}
      </div>

      {hint && (
        <p id={hintId} className="text-xs text-amber-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-center gap-1.5 text-xs text-rose-400">
          <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
