// Kicker + title + subtitle at the top of each auth form.
export default function FormHeader({ icon: Icon, kicker, title, children }) {
  return (
    <div className="mb-7">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-700/50 bg-gray-900/80 shadow-inner shadow-purple-500/10">
        <Icon className="h-6 w-6 text-purple-400" aria-hidden="true" />
      </div>
      <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-neon-teal uppercase">// {kicker}</p>
      <h2 className="mb-2 font-display text-3xl font-bold text-white uppercase">{title}</h2>
      <p className="text-sm text-gray-400">{children}</p>
    </div>
  );
}
