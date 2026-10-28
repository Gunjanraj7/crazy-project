import { useState } from 'react';
import { CalendarDays, LogOut, Mail, Save, Trash2, UserRound } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import HexInitials from '@/components/ui/HexInitials';
import InputField from '@/components/ui/InputField';
import Panel from '@/components/ui/Panel';
import Toggle from '@/components/ui/Toggle';
import { hasErrors, PasswordInput, useAuth, validateEmail, validatePasswordChange } from '@/features/auth';
import { useConversations } from '@/features/chat/hooks/useConversations';
import { clearAllMessages } from '@/features/chat/services/chatStorage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/lib/time';

const BIO_LIMIT = 160;

function IdentityForm() {
  const { user, updateProfile } = useAuth();
  const [values, setValues] = useState({ displayName: user.displayName ?? '', email: user.email ?? '', bio: user.bio ?? '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {
      displayName: values.displayName.trim() ? undefined : 'Display name can’t be empty.',
      email: validateEmail(values.email),
    };
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSaving(true);
    try {
      await updateProfile({ ...values, displayName: values.displayName.trim(), bio: values.bio.trim() });
      setMessage({ variant: 'success', text: 'Profile updated.' });
    } catch (err) {
      setMessage({ variant: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel kicker="Identity" title="Profile" description="How you appear to the personas.">
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {message && <Alert variant={message.variant}>{message.text}</Alert>}
        <div className="grid gap-5 2xl:grid-cols-2">
          <InputField label="Display name" icon={UserRound} name="displayName" value={values.displayName} error={errors.displayName} onChange={handleChange} />
          <InputField label="Email" icon={Mail} name="email" type="email" value={values.email} error={errors.email} onChange={handleChange} />
        </div>
        <InputField
          multiline
          label="Bio"
          name="bio"
          maxLength={BIO_LIMIT}
          placeholder="A line about you…"
          value={values.bio}
          onChange={handleChange}
        />
        <Button type="submit" loading={saving} block={false} className="px-6">
          <Save className="h-4 w-4" aria-hidden="true" />
          Save changes
        </Button>
      </form>
    </Panel>
  );
}

function InterfacePrefs() {
  const { prefs, updatePrefs } = useAuth();

  return (
    <Panel kicker="Interface" title="Effects" description="Tune the neon. Saved to your account.">
      <div className="divide-y divide-gray-800/60">
        <Toggle
          label="Typewriter replies"
          description="Avatars type their messages out letter by letter."
          checked={prefs.typewriter}
          onChange={(typewriter) => updatePrefs({ typewriter })}
        />
        <Toggle
          label="CRT scanlines"
          description="Retro scanline overlay across the interface."
          checked={prefs.scanlines}
          onChange={(scanlines) => updatePrefs({ scanlines })}
        />
        <Toggle
          label="Cursor glow"
          description="Soft neon light that follows your mouse."
          checked={prefs.cursorGlow}
          onChange={(cursorGlow) => updatePrefs({ cursorGlow })}
        />
      </div>
    </Panel>
  );
}

const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '', confirmPassword: '' };

function PasswordForm() {
  const { changePassword } = useAuth();
  const [values, setValues] = useState(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validatePasswordChange(values);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSaving(true);
    try {
      await changePassword(values);
      setValues(EMPTY_PASSWORDS);
      setMessage({ variant: 'success', text: 'Password changed.' });
    } catch (err) {
      setMessage({ variant: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel kicker="Security" title="Password">
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {message && <Alert variant={message.variant}>{message.text}</Alert>}
        <PasswordInput
          label="Current password"
          name="currentPassword"
          autoComplete="current-password"
          value={values.currentPassword}
          error={errors.currentPassword}
          onChange={handleChange}
        />
        <PasswordInput
          label="New password"
          name="newPassword"
          autoComplete="new-password"
          value={values.newPassword}
          error={errors.newPassword}
          onChange={handleChange}
        />
        <PasswordInput
          label="Confirm new password"
          name="confirmPassword"
          autoComplete="new-password"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          onChange={handleChange}
        />
        <Button type="submit" variant="secondary" loading={saving} block={false} className="px-6">
          Update password
        </Button>
      </form>
    </Panel>
  );
}

function DangerZone() {
  const { user, logout } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState(false);

  const clearHistory = () => {
    clearAllMessages(user.username);
    setConfirming(false);
    setCleared(true);
  };

  return (
    <Panel kicker="Danger zone" title="Data & session" className="border-rose-500/20">
      <div className="space-y-4">
        {cleared && <Alert variant="success">All conversations wiped.</Alert>}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-200">Clear chat history</p>
            <p className="text-xs text-gray-500">Deletes every conversation with every avatar.</p>
          </div>
          {confirming ? (
            <div className="flex gap-2">
              <Button variant="danger" block={false} onClick={clearHistory}>
                Yes, wipe it
              </Button>
              <Button variant="ghost" block={false} onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="danger" block={false} onClick={() => setConfirming(true)}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear history
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-3 border-t border-gray-800/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-200">Sign out</p>
            <p className="text-xs text-gray-500">End this session on this device.</p>
          </div>
          <Button variant="secondary" block={false} onClick={logout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </div>
    </Panel>
  );
}

export default function ProfilePage() {
  useDocumentTitle('Profile');
  const { user } = useAuth();
  const conversations = useConversations(user.username);
  const name = user.displayName || user.username;
  const totalSent = conversations.reduce((sum, c) => sum + c.sent, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8 lg:p-10">
      <section className="relative animate-fade-up overflow-hidden rounded-3xl border border-gray-800/60 bg-night-800/50 p-6 backdrop-blur-sm sm:p-8">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-neon-teal/10 blur-[90px]" />
        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <HexInitials name={name} className="h-24 w-24 text-3xl" />
          <div className="min-w-0 flex-1">
            <p className="mb-1 font-mono text-[10px] tracking-[0.25em] text-neon-teal uppercase">// Operator file</p>
            <h1 className="truncate font-display text-3xl font-bold uppercase">{name}</h1>
            <p className="font-mono text-sm text-gray-500">@{user.username}</p>
            {user.bio && <p className="mt-3 text-sm text-gray-300">{user.bio}</p>}
          </div>
          <dl className="flex gap-6 sm:flex-col sm:gap-3 sm:text-right">
            <div>
              <dt className="font-mono text-[10px] tracking-widest text-gray-500 uppercase">Messages</dt>
              <dd className="font-display text-xl font-bold">{totalSent}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] tracking-widest text-gray-500 uppercase">Joined</dt>
              <dd className="flex items-center gap-1.5 text-sm text-gray-300 sm:justify-end">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDate(user.createdAt)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <IdentityForm />
          <InterfacePrefs />
        </div>
        <div className="space-y-6">
          <PasswordForm />
          <DangerZone />
        </div>
      </div>
    </div>
  );
}
