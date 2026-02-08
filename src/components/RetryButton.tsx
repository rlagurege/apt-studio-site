"use client";

import { useState } from "react";

type RetryButtonProps = {
  onRetry: () => Promise<void>;
  className?: string;
};

export default function RetryButton({ onRetry, className = "" }: RetryButtonProps) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <button
      onClick={handleRetry}
      disabled={retrying}
      className={`px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 ${className}`}
    >
      {retrying ? "Retrying..." : "Retry"}
    </button>
  );
}
