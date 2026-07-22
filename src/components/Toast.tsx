"use client";

import { useEffect } from "react";

export default function Toast({
  message,
  onDone,
  duration = 2600,
}: {
  message: string | null;
  onDone: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [message, onDone, duration]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4"
    >
      {message && (
        <div className="glass pointer-events-auto flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium text-ink shadow-[var(--shadow-float)]">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-b from-brand-400 to-brand-600 text-white">
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5 9-9" />
            </svg>
          </span>
          {message}
        </div>
      )}
    </div>
  );
}
