import { CircleCheck, LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function LoginSuccess({ user, onSignOut }) {
  const details = [
    { label: 'Operator', value: user.username },
    { label: 'Signed in', value: user.signedInAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Clearance', value: 'Level 3' },
  ];

  return (
    <div className="animate-fade-up text-center" role="status">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_30px_rgba(34,197,94,0.25)]">
        <CircleCheck className="h-8 w-8 text-emerald-400" aria-hidden="true" />
      </div>

      <p className="mb-3 text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Access granted</p>
      <h2 className="mb-2 text-3xl font-bold text-white">Welcome, {user.username}</h2>
      <p className="mb-8 text-sm text-gray-400">Your identity has been verified.</p>

      <dl className="mb-8 divide-y divide-gray-800/60 rounded-xl border border-gray-800/60 bg-night-700/50 text-left text-sm">
        {details.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <dt className="text-gray-500">{label}</dt>
            <dd className="font-mono text-gray-200">{value}</dd>
          </div>
        ))}
      </dl>

      <Button variant="secondary" onClick={onSignOut}>
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign out
      </Button>
    </div>
  );
}
