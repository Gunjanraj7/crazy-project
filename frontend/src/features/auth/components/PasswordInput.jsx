import { useRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import InputField from '@/components/ui/InputField';
import { MOOD } from '../constants';

const moodFor = (visible) => (visible ? MOOD.PEEKING : MOOD.HIDING);

// Password field with show/hide toggle and Caps Lock warning. When `onMoodChange` is given,
// the neural core raises its shield while you type and lowers it when the password is revealed.
export default function PasswordInput({ onMoodChange, onChange, onFocus, onBlur, hint, ...props }) {
  const [visible, setVisible] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const inputRef = useRef(null);

  const toggleVisibility = () => {
    const next = !visible;
    setVisible(next);
    if (document.activeElement === inputRef.current) onMoodChange?.(moodFor(next));
  };

  const handleCapsLock = (e) => setCapsLockOn(e.getModifierState('CapsLock'));

  return (
    <InputField
      ref={inputRef}
      icon={Lock}
      type={visible ? 'text' : 'password'}
      hint={capsLockOn ? 'Caps Lock is on.' : hint}
      onKeyDown={handleCapsLock}
      onKeyUp={handleCapsLock}
      onChange={(e) => {
        onChange?.(e);
        onMoodChange?.(moodFor(visible));
      }}
      onFocus={(e) => {
        onFocus?.(e);
        onMoodChange?.(moodFor(visible));
      }}
      onBlur={(e) => {
        onBlur?.(e);
        setCapsLockOn(false);
        onMoodChange?.(MOOD.IDLE);
      }}
      trailing={
        <button
          type="button"
          // Keep focus in the input so the core's reaction follows the toggle.
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleVisibility}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-300 focus-visible:outline-2 focus-visible:outline-purple-400"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      {...props}
    />
  );
}
