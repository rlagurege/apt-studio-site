"use client";

import { useEffect, useState } from "react";

type Shortcut = {
  key: string;
  description: string;
  action: () => void;
};

type KeyboardShortcutsProps = {
  shortcuts: Shortcut[];
  showHelp?: boolean;
};

export default function KeyboardShortcuts({ shortcuts, showHelp = false }: KeyboardShortcutsProps) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show help modal with ? key
      if (e.key === "?" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowModal(true);
        return;
      }

      // Don't trigger shortcuts if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Check for matching shortcuts
      for (const shortcut of shortcuts) {
        const keys = shortcut.key.toLowerCase().split("+");
        const ctrlOrCmd = keys.includes("ctrl") || keys.includes("cmd");
        const shift = keys.includes("shift");
        const alt = keys.includes("alt");
        const key = keys[keys.length - 1];

        if (
          (ctrlOrCmd ? e.metaKey || e.ctrlKey : !e.metaKey && !e.ctrlKey) &&
          (shift ? e.shiftKey : !e.shiftKey) &&
          (alt ? e.altKey : !e.altKey) &&
          e.key.toLowerCase() === key
        ) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);

  if (!showHelp && !showModal) return null;

  return (
    <>
      {showHelp && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-[var(--accent)] text-white shadow-lg hover:opacity-90 transition-opacity"
          title="Keyboard Shortcuts (Ctrl+?)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Keyboard Shortcuts</h2>
            <div className="space-y-2">
              {shortcuts.map((shortcut, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--muted)]">{shortcut.description}</span>
                  <kbd className="px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)]">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-[var(--muted)] text-center">
              Press Ctrl+? (or Cmd+? on Mac) anytime to show this help
            </p>
          </div>
        </div>
      )}
    </>
  );
}
