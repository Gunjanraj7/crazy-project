import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, AtSign, CircleCheck, Mail, UserPlus, UserRound } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import InputField from '@/components/ui/InputField';
import { MOOD, SUCCESS_REDIRECT_DELAY_MS, typingProgress } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useCoreMood } from '../hooks/useCoreMood';
import { signup } from '../services/authService';
import { hasErrors, validateSignup } from '../utils/validators';
import FormHeader from './FormHeader';
import PasswordInput from './PasswordInput';
import PasswordStrength from './PasswordStrength';

const INITIAL_VALUES = { displayName: '', username: '', email: '', password: '', confirmPassword: '', acceptTerms: false };

export default function SignupForm() {
  const onMoodChange = useCoreMood();
  const { startSession } = useAuth();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | submitting | success
  const busy = status !== 'idle';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setMessage(null);
    if (type !== 'checkbox' && !name.toLowerCase().includes('password')) {
      onMoodChange(MOOD.TYPING, typingProgress(value));
    }
  };

  // Text fields make the core "read along"; password fields are handled by PasswordInput.
  const readAlong = {
    onFocus: (e) => onMoodChange(MOOD.TYPING, typingProgress(e.target.value)),
    onBlur: () => onMoodChange(MOOD.IDLE),
    onChange: handleChange,
    readOnly: busy,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;

    const validationErrors = validateSignup(values);
    setErrors(validationErrors);
    setMessage(null);
    if (hasErrors(validationErrors)) {
      onMoodChange(MOOD.ERROR);
      return;
    }

    setStatus('submitting');
    onMoodChange(MOOD.LOADING);
    try {
      const user = await signup(values);
      setStatus('success');
      onMoodChange(MOOD.SUCCESS);
      setTimeout(() => startSession(user), SUCCESS_REDIRECT_DELAY_MS);
    } catch (err) {
      setMessage({ variant: 'error', text: err.message });
      onMoodChange(MOOD.ERROR);
      setStatus('idle');
    }
  };

  return (
    <>
      <FormHeader icon={UserPlus} kicker="New identity" title="Create account">
        One account, eight minds to talk to.
      </FormHeader>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {message && <Alert variant={message.variant}>{message.text}</Alert>}

        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            label="Display name"
            icon={UserRound}
            name="displayName"
            autoComplete="name"
            placeholder="Neo"
            value={values.displayName}
            error={errors.displayName}
            {...readAlong}
          />
          <InputField
            label="Username"
            icon={AtSign}
            name="username"
            autoComplete="username"
            placeholder="neo_runner"
            value={values.username}
            error={errors.username}
            {...readAlong}
          />
        </div>

        <InputField
          label="Email"
          icon={Mail}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@domain.com"
          value={values.email}
          error={errors.email}
          {...readAlong}
        />

        <PasswordInput
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={values.password}
          error={errors.password}
          readOnly={busy}
          onChange={handleChange}
          onMoodChange={onMoodChange}
        />
        <PasswordStrength password={values.password} />

        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Type it again"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          readOnly={busy}
          onChange={handleChange}
          onMoodChange={onMoodChange}
        />

        <div>
          <Checkbox
            name="acceptTerms"
            checked={values.acceptTerms}
            onChange={handleChange}
            aria-invalid={errors.acceptTerms ? true : undefined}
            label={
              <span>
                I agree to the <span className="text-purple-400">Terms</span> and{' '}
                <span className="text-purple-400">Privacy Policy</span>
              </span>
            }
          />
          {errors.acceptTerms && <p className="mt-2 text-xs text-rose-400">{errors.acceptTerms}</p>}
        </div>

        <Button type="submit" loading={status === 'submitting'} disabled={status === 'success'} className="py-3.5">
          {status === 'submitting' && 'Creating identity…'}
          {status === 'success' && (
            <>
              <CircleCheck className="h-4 w-4" aria-hidden="true" />
              Identity created
            </>
          )}
          {status === 'idle' && (
            <>
              Create account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-purple-400 transition-colors hover:text-purple-300">
          Sign in
        </Link>
      </p>
    </>
  );
}
