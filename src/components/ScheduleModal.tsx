"use client";

import { useState, useEffect } from "react";

type ScheduleModalProps = {
  isOpen: boolean;
  requestId: string | null;
  requestTitle?: string;
  initialDate?: Date;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ScheduleModal({
  isOpen,
  requestId,
  requestTitle,
  initialDate,
  onClose,
  onSuccess,
}: ScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [artists, setArtists] = useState<Array<{ id: string; name: string; email: string }>>([]);
  
  // Format date for datetime-local input
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Set default start time to 2 hours from now, or use initialDate
  const getDefaultStartTime = () => {
    if (initialDate) {
      return formatDateForInput(initialDate);
    }
    const now = new Date();
    now.setHours(now.getHours() + 2);
    now.setMinutes(0); // Round to nearest hour
    return formatDateForInput(now);
  };

  // Set default end time to 3 hours after start
  const getDefaultEndTime = (startTime: string) => {
    if (!startTime) return "";
    const start = new Date(startTime);
    start.setHours(start.getHours() + 3);
    return formatDateForInput(start);
  };

  const [formData, setFormData] = useState({
    artistId: "",
    title: requestTitle || "",
    startAt: getDefaultStartTime(),
    endAt: "",
    timezone: "America/New_York",
    notesInternal: "",
  });

  // Update end time when start time changes
  useEffect(() => {
    if (formData.startAt && !formData.endAt) {
      setFormData(prev => ({
        ...prev,
        endAt: getDefaultEndTime(formData.startAt)
      }));
    }
  }, [formData.startAt]);

  // Reset form when modal opens/closes or initialDate changes
  useEffect(() => {
    if (isOpen) {
      const defaultStart = getDefaultStartTime();
      setFormData({
        artistId: "",
        title: requestTitle || "",
        startAt: defaultStart,
        endAt: getDefaultEndTime(defaultStart),
        timezone: "America/New_York",
        notesInternal: "",
      });
    }
  }, [isOpen, requestTitle, initialDate]);

  // Fetch artists on mount
  useEffect(() => {
    if (isOpen) {
      fetch("/api/users?role=artist")
        .then((res) => res.json())
        .then((data) => {
          if (data.users) {
            setArtists(data.users);
          }
        })
        .catch(() => {
          // Fallback: try to get from a different endpoint or use hardcoded list
        });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.artistId || !formData.title || !formData.startAt || !formData.endAt) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Convert datetime-local to ISO format
    const startAtISO = new Date(formData.startAt).toISOString();
    const endAtISO = new Date(formData.endAt).toISOString();

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(requestId && requestId !== "new" ? { requestId } : {}),
          artistId: formData.artistId,
          title: formData.title,
          startAt: startAtISO,
          endAt: endAtISO,
          timezone: formData.timezone,
          notesInternal: formData.notesInternal || undefined,
        }),
      });

      const result = await res.json();
      if (result.appointment) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Failed to schedule appointment");
      }
    } catch (err) {
      setError("Failed to schedule appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">Schedule Appointment</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="artistId" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Artist *
            </label>
            <select
              id="artistId"
              value={formData.artistId}
              onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              required
            >
              <option value="">Select an artist</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Appointment Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              placeholder="e.g. Tattoo Session - Forearm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startAt" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Start Date/Time *
              </label>
              <input
                id="startAt"
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="endAt" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                End Date/Time *
              </label>
              <input
                id="endAt"
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="notesInternal" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Internal Notes (optional)
            </label>
            <textarea
              id="notesInternal"
              value={formData.notesInternal}
              onChange={(e) => setFormData({ ...formData, notesInternal: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none min-h-[80px]"
              placeholder="Any internal notes about this appointment..."
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-600/50 bg-red-900/30 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
