import { APP_VERSION } from '@/config/app';

// Glassy HUD card that frames the auth forms.
export default function AuthCard({ children }) {
  return (
    <div className="relative w-full max-w-[460px] animate-fade-up [animation-delay:150ms]">
      {/* HUD corner brackets */}
      <span aria-hidden="true" className="absolute -top-2 -left-2 h-6 w-6 border-t-2 border-l-2 border-neon-teal/70" />
      <span aria-hidden="true" className="absolute -right-2 -bottom-2 h-6 w-6 border-r-2 border-b-2 border-neon-pink/70" />

      <div className="relative overflow-hidden rounded-2xl border border-gray-800/60 bg-night-800/80 p-7 shadow-2xl backdrop-blur-xl sm:p-9">
        {/* Subtle top edge glow */}
        <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-purple-500/60 to-transparent" />

        {children}

        <footer className="mt-8 flex items-center justify-center gap-2 border-t border-gray-800/60 pt-5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
          </span>
          <p className="font-mono text-xs text-gray-500">Encrypted channel · {APP_VERSION}</p>
        </footer>
      </div>
    </div>
  );
}
