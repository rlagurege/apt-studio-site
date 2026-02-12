"use client";

import { useEffect, useState } from "react";

type ConflictWarningProps = {
  artistId: string;
  startAt: string;
  endAt: string;
  excludeId?: string;
  onConflictDetected?: (hasConflict: boolean) => void;
};

export default function ConflictWarning({
  artistId,
  startAt,
  endAt,
  excludeId,
  onConflictDetected,
}: ConflictWarningProps) {
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [availabilityBlocks, setAvailabilityBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!artistId || !startAt || !endAt) {
      setConflicts([]);
      onConflictDetected?.(false);
      return;
    }

    const checkConflicts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          artistId,
          startAt,
          endAt,
        });
        if (excludeId) params.append("excludeId", excludeId);

        const res = await fetch(`/api/appointments/conflicts?${params}`);
        const data = await res.json();

        if (data.hasConflict) {
          setConflicts(data.conflicts || []);
          setAvailabilityBlocks(data.availabilityBlocks || []);
          onConflictDetected?.(true);
        } else {
          setConflicts([]);
          setAvailabilityBlocks([]);
          onConflictDetected?.(false);
        }
      } catch (error) {
        console.error("Failed to check conflicts:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(checkConflicts, 500); // Debounce
    return () => clearTimeout(timeout);
  }, [artistId, startAt, endAt, excludeId, onConflictDetected]);

  if (loading || (conflicts.length === 0 && availabilityBlocks.length === 0)) return null;

  return (
    <div className="rounded-lg border-2 border-red-500 bg-red-500/10 p-3 mb-4">
      <div className="flex items-start gap-2">
        <svg
          className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-500 mb-1">Scheduling Conflict Detected!</p>
          <p className="text-xs text-red-400 mb-2">
            This artist has {conflicts.length + availabilityBlocks.length} conflict{conflicts.length + availabilityBlocks.length > 1 ? "s" : ""} during this time:
          </p>
          <ul className="text-xs text-red-300 space-y-1">
            {conflicts.map((conflict) => (
              <li key={conflict.id}>
                • Appointment: {conflict.customer} - {new Date(conflict.startAt).toLocaleString()}
              </li>
            ))}
            {availabilityBlocks.map((block) => (
              <li key={block.id}>
                • Availability Block: {new Date(block.startAt).toLocaleString()} - {new Date(block.endAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
