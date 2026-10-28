import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import AnimatedBackground from '@/components/effects/AnimatedBackground';
import Button from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Signal lost');

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-void p-6 text-center text-white">
      <AnimatedBackground />
      <div className="relative animate-fade-up">
        <p className="mb-4 font-mono text-xs tracking-[0.3em] text-neon-pink uppercase">// Error · route not found</p>
        <h1 className="mb-4 font-display text-8xl font-bold sm:text-9xl">
          <span className="glitch" data-text="404">
            404
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-sm text-gray-400">Signal lost. This sector of the grid doesn&apos;t exist, or it was wiped.</p>
        <Button as={Link} to="/" block={false} className="px-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Return to base
        </Button>
      </div>
    </main>
  );
}
