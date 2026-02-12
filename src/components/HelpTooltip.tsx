"use client";

import { useState } from "react";

type HelpTooltipProps = {
  content: string;
  children?: React.ReactNode;
};

export default function HelpTooltip({ content, children }: HelpTooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        {children || (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] shadow-lg">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[var(--border)]" />
        </div>
      )}
    </div>
  );
}
