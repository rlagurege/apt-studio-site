"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

type AvailabilityBlock = {
  id: string;
  startAt: string;
  endAt: string;
  type: "blocked" | "vacation" | "walk_in_only";
  notes: string | null;
  artist: {
    id: string;
    name: string;
  };
};

type AvailabilityManagerProps = {
  artistId?: string;
  onBlockCreated?: () => void;
};

export default function AvailabilityManager({ artistId, onBlockCreated }: AvailabilityManagerProps) {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    startAt: "",
    endAt: "",
    type: "blocked" as "blocked" | "vacation" | "walk_in_only",
    notes: "",
  });

  useEffect(() => {
    loadBlocks();
  }, [artistId]);

  const loadBlocks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (artistId) params.append("artistId", artistId);
      const res = await fetch(`/api/availability?${params}`);
      const data = await res.json();
      setBlocks(data.blocks || []);
    } catch (error) {
      console.error("Failed to load availability blocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId,
          startAt: new Date(formData.startAt).toISOString(),
          endAt: new Date(formData.endAt).toISOString(),
          type: formData.type,
          notes: formData.notes || null,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({ startAt: "", endAt: "", type: "blocked", notes: "" });
        loadBlocks();
        onBlockCreated?.();
      }
    } catch (error) {
      console.error("Failed to create availability block:", error);
    }
  };

  const handleDelete = async (blockId: string) => {
    if (!confirm("Delete this availability block?")) return;
    try {
      const res = await fetch(`/api/availability/${blockId}`, { method: "DELETE" });
      if (res.ok) {
        loadBlocks();
      }
    } catch (error) {
      console.error("Failed to delete block:", error);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      blocked: "Blocked",
      vacation: "Vacation",
      walk_in_only: "Walk-in Only",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      blocked: "bg-red-500/20 text-red-500",
      vacation: "bg-blue-500/20 text-blue-500",
      walk_in_only: "bg-yellow-500/20 text-yellow-500",
    };
    return colors[type as keyof typeof colors] || "bg-gray-500/20 text-gray-500";
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Availability Blocks</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90"
        >
          {showForm ? "Cancel" : "+ Add Block"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Start</label>
              <input
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">End</label>
              <input
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
            >
              <option value="blocked">Blocked</option>
              <option value="vacation">Vacation</option>
              <option value="walk_in_only">Walk-in Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              rows={2}
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90"
          >
            Create Block
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-[var(--muted)]">Loading...</div>
      ) : blocks.length === 0 ? (
        <div className="text-center py-8 text-[var(--muted)]">No availability blocks</div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(block.type)}`}>
                    {getTypeLabel(block.type)}
                  </span>
                  {!artistId && <span className="text-sm text-[var(--muted)]">{block.artist.name}</span>}
                </div>
                <div className="text-sm text-[var(--foreground)]">
                  {format(new Date(block.startAt), "MMM d, h:mm a")} - {format(new Date(block.endAt), "MMM d, h:mm a")}
                </div>
                {block.notes && <div className="text-xs text-[var(--muted)] mt-1">{block.notes}</div>}
              </div>
              <button
                onClick={() => handleDelete(block.id)}
                className="ml-4 p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
