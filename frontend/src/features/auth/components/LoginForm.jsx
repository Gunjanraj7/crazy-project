import { useRef, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Shield, User } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import InputField from '@/components/ui/InputField';
import { MOOD } from '../constants';
import {
  DEMO_CREDENTIALS,
  getRememberedUsername,
  login,
  setRememberedUsername,
} from '../services/authService';
import { validateLogin } from '../utils/validateLogin';
import SocialLogin from './SocialLogin';

// Username length at which the cat's eyes reach the far end of the input.
const FULL_LOOK_LENGTH = 24;

const usernameLookProgress = (username) => Math.min(username.length / FULL_LOOK_LENGTH, 1);

export default function LoginForm({ onMoodChange, onSuccess }) {
  const [values, setValues] = useState(() => ({ username: getRememberedUsername(), password: '' }));
  const [remember, setRemember] = useState(() => Boolean(getRememberedUsername()));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const passwordRef = useRef(null);

  const passwordMood = (visible) => (visible ? MOOD.PEEKING : MOOD.HIDING);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setMessage(null);

    if (name === 'username') onMoodChange(MOOD.TYPING, usernameLookProgress(value));
    else onMoodChange(passwordMood(showPassword));
  };

  const togglePasswordVisibility = () => {
    const next = !showPassword;
    setShowPassword(next);
    if (document.activeElement === passwordRef.current) onMoodChange(passwordMood(next));
  };

  const handleCapsLock = (e) => setCapsLockOn(e.getModifierState('CapsLock'));

  const showNotice = (text) => setMessage({ variant: 'info', text });

  const fillDemoCredentials = () => {
    setValues({ ...DEMO_CREDENTIALS });
    setErrors({});
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateLogin(values);
    setErrors(validationErrors);
    setMessage(null);
    if (Object.keys(validationErrors).length > 0) {
      onMoodChange(MOOD.ERROR);
      return;
    }

    setIsSubmitting(true);
    onMoodChange(MOOD.LOADING);
    try {
      const { user } = await login(values);
      setRememberedUsername(remember ? user.username : null);
      onMoodChange(MOOD.SUCCESS);
      onSuccess(user);
    } catch (err) {
      setMessage({ variant: 'error', text: err.message });
      setValues((prev) => ({ ...prev, password: '' }));
      onMoodChange(MOOD.ERROR);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-700/50 bg-gray-900/80 shadow-inner shadow-purple-500/10">
        <Shield className="h-6 w-6 text-purple-400" aria-hidden="true" />
      </div>

      <div className="mb-8">
        <p className="mb-3 text-[10px] font-bold tracking-widest text-neon-teal uppercase">
          Authentication Portal
        </p>
        <h2 className="mb-2 text-3xl font-bold text-white">Welcome back</h2>
        <p className="text-sm text-gray-400">Enter your credentials to continue.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {message && <Alert variant={message.variant}>{message.text}</Alert>}

        <InputField
          label="Username"
          icon={User}
          name="username"
          type="text"
          autoComplete="username"
          placeholder="Enter your username"
          value={values.username}
          error={errors.username}
          readOnly={isSubmitting}
          onChange={handleChange}
          onFocus={(e) => onMoodChange(MOOD.TYPING, usernameLookProgress(e.target.value))}
          onBlur={() => onMoodChange(MOOD.IDLE)}
        />

        <InputField
          ref={passwordRef}
          label="Password"
          icon={Lock}
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={values.password}
          error={errors.password}
          hint={capsLockOn ? 'Caps Lock is on.' : undefined}
          readOnly={isSubmitting}
          onChange={handleChange}
          onKeyDown={handleCapsLock}
          onKeyUp={handleCapsLock}
          onFocus={() => onMoodChange(passwordMood(showPassword))}
          onBlur={() => {
            setCapsLockOn(false);
            onMoodChange(MOOD.IDLE);
          }}
          labelAction={
            <button
              type="button"
              onClick={() => showNotice('Password resets are handled by your administrator for now.')}
              className="text-xs font-medium text-purple-400 transition-colors hover:text-purple-300"
            >
              Forgot password?
            </button>
          }
          trailing={
            <button
              type="button"
              // Keep focus in the input so the cat's reaction follows the toggle.
              onMouseDown={(e) => e.preventDefault()}
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-300 focus-visible:outline-2 focus-visible:outline-purple-400"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        <Checkbox
          label="Remember me"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />

        <Button type="submit" loading={isSubmitting} className="py-3.5">
          {isSubmitting ? (
            'Verifying…'
          ) : (
            <>
              Login
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 space-y-6">
        <SocialLogin
          disabled={isSubmitting}
          onSelect={(provider) =>
            showNotice(`${provider} sign-in isn't connected yet. Try the demo account below.`)
          }
        />

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-gray-800 px-4 py-3 text-xs text-gray-500">
          <span>
            Demo: <code className="font-mono text-gray-300">{DEMO_CREDENTIALS.username}</code> /{' '}
            <code className="font-mono text-gray-300">{DEMO_CREDENTIALS.password}</code>
          </span>
          <button
            type="button"
            onClick={fillDemoCredentials}
            disabled={isSubmitting}
            className="font-medium text-neon-teal transition-colors hover:text-teal-300 disabled:opacity-50"
          >
            Autofill
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => showNotice('Access requests are reviewed by your security team.')}
            className="font-medium text-purple-400 transition-colors hover:text-purple-300"
          >
            Request access
          </button>
        </p>
      </div>
    </>
  );
}
