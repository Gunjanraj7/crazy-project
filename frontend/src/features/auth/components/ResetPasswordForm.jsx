import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { MOOD } from '../constants';
import { useCoreMood } from '../hooks/useCoreMood';
import { resetPassword } from '../services/authService';
import { hasErrors, validatePasswordChange } from '../utils/validators';
import FormHeader from './FormHeader';
import PasswordInput from './PasswordInput';
import PasswordStrength from './PasswordStrength';

// Landing page for the link from "forgot password": /reset-password?token=...
export default function ResetPasswordForm() {
  const onMoodChange = useCoreMood();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [values, setValues] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | saving | done

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Reuses the change-password rules; there is no "current password" here.
    const { newPassword, confirmPassword } = validatePasswordChange({ currentPassword: '-', ...values });
    const validationErrors = { newPassword, confirmPassword };
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) {
      onMoodChange(MOOD.ERROR);
      return;
    }

    setStatus('saving');
    onMoodChange(MOOD.LOADING);
    try {
      await resetPassword({ token, newPassword: values.newPassword });
      setStatus('done');
      onMoodChange(MOOD.SUCCESS);
    } catch (err) {
      setErrors(err.fieldErrors ?? {});
      setMessage(err.message);
      setStatus('idle');
      onMoodChange(MOOD.ERROR);
    }
  };

  if (!token) {
    return (
      <>
        <FormHeader icon={KeyRound} kicker="Recovery" title="Invalid link">
          This reset link is missing its code. Request a new one and use the link from the message.
        </FormHeader>
        <Button as={Link} to="/forgot-password">
          Request a new link
        </Button>
      </>
    );
  }

  if (status === 'done') {
    return (
      <div className="animate-fade-up text-center" role="status">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_30px_rgba(34,197,94,0.25)]">
          <ShieldCheck className="h-8 w-8 text-emerald-400" aria-hidden="true" />
        </div>
        <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-emerald-400 uppercase">// Credentials rewritten</p>
        <h2 className="mb-3 font-display text-3xl font-bold uppercase">Password updated</h2>
        <p className="mb-8 text-sm text-gray-400">For safety, you&apos;ve been signed out everywhere. Sign in with your new password.</p>
        <Button as={Link} to="/login">
          Sign in
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <FormHeader icon={KeyRound} kicker="Recovery" title="New password">
        Choose a new password for your account.
      </FormHeader>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {message && (
          <Alert variant="error">
            {message}{' '}
            <Link to="/forgot-password" className="underline underline-offset-2">
              Request a new link
            </Link>
          </Alert>
        )}

        <PasswordInput
          label="New password"
          name="newPassword"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={values.newPassword}
          error={errors.newPassword}
          readOnly={status === 'saving'}
          onChange={handleChange}
          onMoodChange={onMoodChange}
        />
        <PasswordStrength password={values.newPassword} />
        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Type it again"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          readOnly={status === 'saving'}
          onChange={handleChange}
          onMoodChange={onMoodChange}
        />

        <Button type="submit" loading={status === 'saving'} className="py-3.5">
          {status === 'saving' ? 'Rewriting credentials…' : 'Set new password'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-purple-400 transition-colors hover:text-purple-300">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </Link>
      </p>
    </>
  );
}
