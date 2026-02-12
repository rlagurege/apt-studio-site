"use client";

import { useState } from "react";

type BulkActionsProps = {
  selectedIds: string[];
  onBulkAction: (action: string, ids: string[]) => Promise<void>;
  onClearSelection: () => void;
};

export default function BulkActions({ selectedIds, onBulkAction, onClearSelection }: BulkActionsProps) {
  const [processing, setProcessing] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleAction = async (action: string) => {
    setProcessing(true);
    try {
      await onBulkAction(action, selectedIds);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="sticky bottom-4 z-10 rounded-xl border-2 border-[var(--accent)] bg-[var(--card)] p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--foreground)]">
            {selectedIds.length} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Clear
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleAction("contacting")}
            disabled={processing}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            Mark Contacting
          </button>
          <button
            onClick={() => handleAction("scheduled")}
            disabled={processing}
            className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 disabled:opacity-50"
          >
            Mark Scheduled
          </button>
          <button
            onClick={() => handleAction("archived")}
            disabled={processing}
            className="px-3 py-1.5 rounded-lg bg-gray-600 text-white text-sm font-medium hover:bg-gray-500 disabled:opacity-50"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}
