// Full-page backdrop: a faint grid plus slowly drifting blurred colour orbs.
export default function AnimatedBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="bg-grid absolute inset-0" />
      <div className="absolute top-[-10%] left-[-10%] h-[45vmax] w-[45vmax] animate-drift rounded-full bg-purple-700/20 blur-[120px]" />
      <div className="absolute right-[-15%] bottom-[-20%] h-[40vmax] w-[40vmax] animate-drift rounded-full bg-teal-500/10 blur-[120px] [animation-delay:-7s]" />
      <div className="absolute top-[40%] left-[35%] h-[25vmax] w-[25vmax] animate-drift rounded-full bg-indigo-600/10 blur-[100px] [animation-delay:-13s]" />
    </div>
  );
}
