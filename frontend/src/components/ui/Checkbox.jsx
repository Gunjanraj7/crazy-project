import { useId } from 'react';
import { Check } from 'lucide-react';

// Native checkbox (keeps keyboard + screen reader support) with a custom look.
export default function Checkbox({ label, id, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      htmlFor={inputId}
      className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-gray-400 transition-colors select-none hover:text-gray-300"
    >
      <span className="relative flex h-4.5 w-4.5 items-center justify-center">
        <input
          id={inputId}
          type="checkbox"
          className="peer absolute inset-0 cursor-pointer appearance-none rounded-[5px] border border-gray-700 bg-night-700 transition-colors checked:border-transparent checked:bg-linear-to-br checked:from-purple-600 checked:to-neon-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
          {...props}
        />
        <Check
          aria-hidden="true"
          strokeWidth={3}
          className="pointer-events-none relative h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
        />
      </span>
      {label}
    </label>
  );
}
