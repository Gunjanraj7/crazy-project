// Glassy card that frames the login form and the signed-in view.
export default function AuthCard({ children }) {
  return (
    <div className="relative w-full max-w-[440px] animate-fade-up overflow-hidden rounded-3xl border border-gray-800/60 bg-night-800/80 p-8 shadow-2xl backdrop-blur-xl [animation-delay:150ms] md:p-10">
      {/* Subtle top edge glow */}
      <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-purple-500/60 to-transparent" />

      {children}

      <footer className="mt-8 flex items-center justify-center gap-2 border-t border-gray-800/60 pt-6">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
        </span>
        <p className="font-mono text-xs text-gray-500">End-to-end encrypted session</p>
      </footer>
    </div>
  );
}
