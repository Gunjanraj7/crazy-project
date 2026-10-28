import { useState } from 'react';
import { SendHorizontal } from 'lucide-react';

const MAX_LENGTH = 500;

// Message box: Enter sends, Shift+Enter adds a new line, grows with its content.
export default function ChatComposer({ avatar, onSend, disabled }) {
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0 && !disabled;

  const submit = (e) => {
    e?.preventDefault();
    if (!canSend) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
  };

  return (
    <form onSubmit={submit} className="relative">
      <div
        className="clip-chamfer flex items-end gap-2 border border-gray-800 bg-night-800/90 p-2 transition-colors focus-within:border-(--accent)"
        style={{ '--accent': avatar.colors[0] }}
      >
        <span className="hidden self-center pl-2 font-mono text-sm text-gray-600 sm:block">&gt;_</span>
        <label htmlFor="chat-input" className="sr-only">
          Message {avatar.name}
        </label>
        <textarea
          id="chat-input"
          rows={1}
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Transmit to ${avatar.name}…`}
          className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] text-white placeholder:text-gray-500 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="clip-chamfer-sm flex h-11 w-11 shrink-0 items-center justify-center text-void transition-all hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-30"
          style={{ background: `linear-gradient(135deg, ${avatar.colors[0]}, ${avatar.colors[1]})` }}
        >
          <SendHorizontal className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-2 flex justify-between px-1 font-mono text-[10px] text-gray-600">
        <span>Enter to send · Shift+Enter for a new line</span>
        <span>
          {text.length}/{MAX_LENGTH}
        </span>
      </p>
    </form>
  );
}
