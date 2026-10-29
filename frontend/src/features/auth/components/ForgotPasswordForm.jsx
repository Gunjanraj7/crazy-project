import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, KeyRound, Mail, MailCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import { MOOD, typingProgress } from '../constants';
import { useCoreMood } from '../hooks/useCoreMood';
import { requestPasswordReset } from '../services/authService';
import { validateEmail } from '../utils/validators';
import FormHeader from './FormHeader';

export default function ForgotPasswordForm() {
  const onMoodChange = useCoreMood();
  const [email, setEmail] = useState('');
  const [error, setError] = useState();
  const [status, setStatus] = useState('idle'); // idle | sending | sent

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateEmail(email);
    setError(validationError);
    if (validationError) {
      onMoodChange(MOOD.ERROR);
      return;
    }

    setStatus('sending');
    onMoodChange(MOOD.LOADING);
    try {
      await requestPasswordReset(email);
      setStatus('sent');
      onMoodChange(MOOD.SUCCESS);
    } catch (err) {
      setError(err.fieldErrors?.email ?? err.message);
      setStatus('idle');
      onMoodChange(MOOD.ERROR);
    }
  };

  const startOver = () => {
    setStatus('idle');
    onMoodChange(MOOD.IDLE);
  };

  if (status === 'sent') {
    return (
      <div className="animate-fade-up text-center" role="status">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_30px_rgba(34,197,94,0.25)]">
          <MailCheck className="h-8 w-8 text-emerald-400" aria-hidden="true" />
        </div>
        <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-emerald-400 uppercase">// Transmission sent</p>
        <h2 className="mb-3 font-display text-3xl font-bold uppercase">Check your inbox</h2>
        <p className="mb-8 text-sm text-gray-400">
          If an account exists for <span className="font-mono text-gray-200">{email}</span>, a reset link is on its way. It
          expires in 30 minutes.
        </p>
        <div className="space-y-3">
          <Button as={Link} to="/login">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign in
          </Button>
          <Button variant="ghost" onClick={startOver}>
            Use a different email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <FormHeader icon={KeyRound} kicker="Recovery" title="Reset password">
        Enter the email linked to your account and we&apos;ll send you a reset link.
      </FormHeader>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <InputField
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@domain.com"
          value={email}
          error={error}
          readOnly={status === 'sending'}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(undefined);
            onMoodChange(MOOD.TYPING, typingProgress(e.target.value));
          }}
          onFocus={(e) => onMoodChange(MOOD.TYPING, typingProgress(e.target.value))}
          onBlur={() => onMoodChange(MOOD.IDLE)}
        />

        <Button type="submit" loading={status === 'sending'} className="py-3.5">
          {status === 'sending' ? 'Sending link…' : 'Send reset link'}
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
