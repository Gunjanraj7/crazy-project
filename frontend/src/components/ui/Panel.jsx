import { cn } from '@/lib/cn';

// Titled settings section.
export default function Panel({ kicker, title, description, className, children }) {
  return (
    <section className={cn('rounded-2xl border border-gray-800/60 bg-night-800/60 p-6 backdrop-blur-sm sm:p-8', className)}>
      <header className="mb-6">
        {kicker && <p className="mb-1.5 font-mono text-[10px] tracking-[0.25em] text-gray-500 uppercase">// {kicker}</p>}
        <h2 className="font-display text-xl font-bold uppercase">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
      </header>
      {children}
    </section>
  );
}
