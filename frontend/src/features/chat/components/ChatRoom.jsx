import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import AvatarSigil from '@/features/avatars/components/AvatarSigil';
import { useChat } from '../hooks/useChat';
import { useStickToBottom } from '../hooks/useStickToBottom';
import AvatarProfile from './AvatarProfile';
import ChatComposer from './ChatComposer';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

// A full conversation with one avatar. Mount with `key={avatar.id}` so switching avatars resets state.
export default function ChatRoom({ avatar, user, typewriter }) {
  const { messages, isTyping, send, reset } = useChat({ avatar, user });
  const [confirmingReset, setConfirmingReset] = useState(false);
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const pinToBottom = useStickToBottom(scrollRef, contentRef);

  const sentCount = messages.filter((m) => m.role === 'user').length;
  const latestReply = messages.findLast((m) => m.role === 'bot' && m.fresh);
  const [primary] = avatar.colors;

  const handleSend = (text) => {
    pinToBottom();
    send(text);
  };

  const handleReset = () => {
    reset();
    setConfirmingReset(false);
  };

  return (
    <div className="flex h-full">
      <AvatarProfile avatar={avatar} messageCount={sentCount} />

      <section className="relative flex min-w-0 flex-1 flex-col">
        {/* Avatar-coloured ambience */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-[0.07]"
          style={{ background: `radial-gradient(ellipse at top, ${primary}, transparent 70%)` }}
        />

        <header className="relative flex items-center gap-3 border-b border-gray-800/60 bg-night-900/60 px-4 py-3 backdrop-blur-xl sm:px-6">
          <Link
            to="/dashboard"
            aria-label="Back to avatars"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-purple-400 xl:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <AvatarSigil avatar={avatar} className="h-10 w-10 xl:hidden" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg font-bold tracking-widest" style={{ color: primary }}>
              {avatar.name}
              <span className="ml-2 hidden font-sans text-xs font-normal tracking-normal text-gray-500 sm:inline">{avatar.title}</span>
            </h1>
            <p className="flex items-center gap-1.5 font-mono text-[11px] text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: isTyping ? '#fcee0a' : '#22c55e' }} />
              {isTyping ? 'composing…' : 'online · link secure'}
            </p>
          </div>

          {confirmingReset ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="hidden text-gray-400 sm:inline">Wipe this conversation?</span>
              <button type="button" onClick={handleReset} className="rounded-md bg-rose-500/15 px-2.5 py-1.5 font-medium text-rose-300 hover:bg-rose-500/25">
                Wipe
              </button>
              <button type="button" onClick={() => setConfirmingReset(false)} className="rounded-md px-2.5 py-1.5 text-gray-400 hover:bg-white/5">
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              disabled={sentCount === 0}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-purple-400 disabled:pointer-events-none disabled:opacity-30"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">New chat</span>
            </button>
          )}
        </header>

        <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto">
          {/* Screen readers get each new reply once, in full, instead of every typewriter frame */}
          <p className="sr-only" aria-live="polite">
            {latestReply ? `${avatar.name} says: ${latestReply.text}` : ''}
          </p>
          <div ref={contentRef} className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
            <p className="mx-auto mb-2 font-mono text-[10px] tracking-[0.3em] text-gray-600 uppercase">
              // Encrypted link with {avatar.name} established
            </p>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} avatar={avatar} animate={typewriter && message.fresh} />
            ))}
            {isTyping && <TypingIndicator avatar={avatar} />}
          </div>
        </div>

        <footer className="relative mx-auto w-full max-w-3xl px-4 pt-2 pb-4 sm:px-6">
          {sentCount === 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              <Sparkles className="mt-1.5 h-4 w-4 text-gray-600" aria-hidden="true" />
              {avatar.prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isTyping}
                  onClick={() => handleSend(prompt)}
                  className="rounded-full border border-gray-800 bg-night-800/80 px-3.5 py-1.5 text-xs text-gray-300 transition-colors hover:border-(--accent) hover:text-white focus-visible:outline-2 focus-visible:outline-purple-400 disabled:opacity-50"
                  style={{ '--accent': primary }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
          <ChatComposer avatar={avatar} onSend={handleSend} disabled={isTyping} />
        </footer>
      </section>
    </div>
  );
}
