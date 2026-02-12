"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";

type WaitlistEntry = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  preferredArtist: string;
  description: string;
  createdAt: string;
  priority: "low" | "normal" | "high";
};

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<string>("all");

  useEffect(() => {
    loadWaitlist();
  }, [selectedArtist]);

  const loadWaitlist = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/waitlist${selectedArtist !== "all" ? `?artist=${selectedArtist}` : ""}`);
      const data = await res.json();
      setWaitlist(data.waitlist || []);
    } catch (error) {
      console.error("Failed to load waitlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (entryId: string) => {
    // Move from waitlist to active request
    try {
      const res = await fetch(`/api/waitlist/${entryId}/activate`, {
        method: "POST",
      });
      if (res.ok) {
        loadWaitlist();
      }
    } catch (error) {
      console.error("Failed to activate waitlist entry:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12 text-[var(--muted)]">Loading waitlist...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Waitlist</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Customers waiting for available appointment slots
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="all">All Artists</option>
            <option value="big-russ">Big Russ</option>
            <option value="kenny-briggs">Kenny Briggs</option>
            <option value="tom-bone">Tom Bone</option>
            <option value="gavin-gomula">Gavin Gomula</option>
            <option value="ron-holt">Ron Holt</option>
          </select>
          <Link
            href="/admin/dashboard"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {waitlist.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
          No customers on waitlist
        </div>
      ) : (
        <div className="space-y-4">
          {waitlist.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 hover:border-[var(--accent)]/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">
                      {entry.customerName}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.priority === "high"
                          ? "bg-red-500/20 text-red-500"
                          : entry.priority === "normal"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-blue-500/20 text-blue-500"
                      }`}
                    >
                      {entry.priority} priority
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-[var(--muted)] mb-3">
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      <a href={`mailto:${entry.customerEmail}`} className="hover:underline">
                        {entry.customerEmail}
                      </a>
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{" "}
                      <a href={`tel:${entry.customerPhone}`} className="hover:underline">
                        {entry.customerPhone}
                      </a>
                    </div>
                    <div>
                      <span className="font-medium">Preferred Artist:</span> {entry.preferredArtist}
                    </div>
                    <div>
                      <span className="font-medium">Added:</span>{" "}
                      {format(new Date(entry.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="text-sm text-[var(--foreground)]">
                    <span className="font-medium">Request:</span> {entry.description}
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleContact(entry.id)}
                    className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Contact Now
                  </button>
                  <a
                    href={`tel:${entry.customerPhone}`}
                    className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-medium hover:bg-[var(--border)] transition-colors text-center"
                  >
                    Call
                  </a>
                  <a
                    href={`sms:${entry.customerPhone}`}
                    className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-medium hover:bg-[var(--border)] transition-colors text-center"
                  >
                    Text
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
