import { useEffect, useState } from 'react';

/** Types out `text` one character at a time, starting after `startDelayMs`. */
export function useTypewriter(text: string, speedMs = 35, startDelayMs = 200): { text: string; done: boolean } {
  const [length, setLength] = useState(0);

  useEffect(() => {
    setLength(0);
    let i = 0;
    let interval: number | undefined;

    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i += 1;
        setLength(i);
        if (i >= text.length && interval) {
          window.clearInterval(interval);
        }
      }, speedMs);
    }, startDelayMs);

    return () => {
      window.clearTimeout(start);
      if (interval) window.clearInterval(interval);
    };
  }, [text, speedMs, startDelayMs]);

  return { text: text.slice(0, length), done: length >= text.length };
}
