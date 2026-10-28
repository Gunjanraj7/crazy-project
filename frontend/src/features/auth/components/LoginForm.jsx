import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CircleCheck, Fingerprint, User } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import InputField from '@/components/ui/InputField';
import { MOOD, SUCCESS_REDIRECT_DELAY_MS, typingProgress } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useCoreMood } from '../hooks/useCoreMood';
import { DEMO_CREDENTIALS, getRememberedUsername, login, setRememberedUsername } from '../services/authService';
import { hasErrors, validateLogin } from '../utils/validators';
import FormHeader from './FormHeader';
import PasswordInput from './PasswordInput';
import SocialLogin from './SocialLogin';

export default function LoginForm() {
  const onMoodChange = useCoreMood();
  const { startSession } = useAuth();
  const [values, setValues] = useState(() => ({ username: getRememberedUsername(), password: '' }));
  const [remember, setRemember] = useState(() => Boolean(getRememberedUsername()));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | submitting | success
  const busy = status !== 'idle';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setMessage(null);
    if (name === 'username') onMoodChange(MOOD.TYPING, typingProgress(value));
  };

  const showNotice = (text) => setMessage({ variant: 'info', text });

  const fillDemoCredentials = () => {
    setValues({ ...DEMO_CREDENTIALS });
    setErrors({});
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;

    const validationErrors = validateLogin(values);
    setErrors(validationErrors);
    setMessage(null);
    if (hasErrors(validationErrors)) {
      onMoodChange(MOOD.ERROR);
      return;
    }

    setStatus('submitting');
    onMoodChange(MOOD.LOADING);
    try {
      const user = await login({ ...values, remember });
      setRememberedUsername(remember ? user.username : null);
      setStatus('success');
      onMoodChange(MOOD.SUCCESS);
      // Let the success animation play, then enter the app (the route guard redirects).
      setTimeout(() => startSession(user), SUCCESS_REDIRECT_DELAY_MS);
    } catch (err) {
      setMessage({ variant: 'error', text: err.message });
      setValues((prev) => ({ ...prev, password: '' }));
      onMoodChange(MOOD.ERROR);
      setStatus('idle');
    }
  };

  return (
    <>
      <FormHeader icon={Fingerprint} kicker="Authentication" title="Jack in">
        Sign in to continue your conversations.
      </FormHeader>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {message && <Alert variant={message.variant}>{message.text}</Alert>}

        <InputField
          label="Username"
          icon={User}
          name="username"
          autoComplete="username"
          placeholder="Enter your username"
          value={values.username}
          error={errors.username}
          readOnly={busy}
          onChange={handleChange}
          onFocus={(e) => onMoodChange(MOOD.TYPING, typingProgress(e.target.value))}
          onBlur={() => onMoodChange(MOOD.IDLE)}
        />

        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={values.password}
          error={errors.password}
          readOnly={busy}
          onChange={handleChange}
          onMoodChange={onMoodChange}
          labelAction={
            <Link to="/forgot-password" className="text-xs font-medium text-purple-400 transition-colors hover:text-purple-300">
              Forgot password?
            </Link>
          }
        />

        <Checkbox label="Keep me signed in" checked={remember} onChange={(e) => setRemember(e.target.checked)} />

        <Button type="submit" loading={status === 'submitting'} disabled={status === 'success'} className="py-3.5">
          {status === 'submitting' && 'Verifying…'}
          {status === 'success' && (
            <>
              <CircleCheck className="h-4 w-4" aria-hidden="true" />
              Access granted
            </>
          )}
          {status === 'idle' && (
            <>
              Sign in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 space-y-6">
        <SocialLogin
          disabled={busy}
          onSelect={(provider) => showNotice(`${provider} sign-in isn't connected yet. Try the demo account below.`)}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-gray-800 px-4 py-3 text-xs text-gray-500">
          <span>
            Demo: <code className="font-mono text-gray-300">{DEMO_CREDENTIALS.username}</code> /{' '}
            <code className="font-mono text-gray-300">{DEMO_CREDENTIALS.password}</code>
          </span>
          <button
            type="button"
            onClick={fillDemoCredentials}
            disabled={busy}
            className="font-medium text-neon-teal transition-colors hover:text-teal-300 disabled:opacity-50"
          >
            Autofill
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          New to the grid?{' '}
          <Link to="/signup" className="font-medium text-purple-400 transition-colors hover:text-purple-300">
            Create an account
          </Link>
        </p>
      </div>
    </>
  );
}
