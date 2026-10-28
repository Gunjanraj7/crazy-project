import { useEffect, useRef } from 'react';

// Keeps a scroll container pinned to the bottom while its content grows (new messages, typewriter),
// unless the user has scrolled up to read history. Returns `pin()` to force-follow again (e.g. on send).
export function useStickToBottom(scrollRef, contentRef) {
  const pinnedRef = useRef(true);

  useEffect(() => {
    const scroller = scrollRef.current;
    const content = contentRef.current;

    const handleScroll = () => {
      pinnedRef.current = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 80;
    };
    const observer = new ResizeObserver(() => {
      if (pinnedRef.current) scroller.scrollTop = scroller.scrollHeight;
    });

    scroller.scrollTop = scroller.scrollHeight;
    scroller.addEventListener('scroll', handleScroll, { passive: true });
    observer.observe(content);
    return () => {
      scroller.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [scrollRef, contentRef]);

  return () => {
    pinnedRef.current = true;
  };
}
