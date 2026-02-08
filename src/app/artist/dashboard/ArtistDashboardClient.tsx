"use client";

import { useEffect, useState } from "react";
import ImageUploadForm from "@/components/ImageUploadForm";

type Appointment = {
  id: string;
  createdAtISO: string;
  artistSlug: string;
  name: string;
  contact: string;
  placement: string;
  size: string;
  styleNotes: string;
  budget?: string;
  timeline?: string;
};

type Notification = {
  id: string;
  type: string;
  message: string;
  createdAtISO: string;
  isToday: boolean;
};

type Data = {
  appointments: Appointment[];
  notifications: Notification[];
};

export default function ArtistDashboardClient({ artistSlug }: { artistSlug: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/artist/appointments")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Could not load appointments."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-600/50 bg-red-900/20 p-6 text-center text-red-200">
        {error}
      </div>
    );
  }

  const appointments = data?.appointments ?? [];
  const notifications = data?.notifications ?? [];
  const todayNotifications = notifications.filter((n) => n.isToday);

  return (
    <div className="space-y-8">
      {/* Image Upload Section */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Add to Gallery</h2>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
          <p className="text-sm text-[var(--muted)] mb-4">
            Upload photos of your work. Add both before & after, or just one photo.
          </p>
          <ImageUploadForm />
        </div>
      </section>

      {/* Notifications (e.g. new requests, today) */}
      {(todayNotifications.length > 0 || notifications.length > 0) && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Notifications</h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]">
            {todayNotifications.length > 0 && (
              <div className="p-4 bg-[var(--accent)]/10 border-l-4 border-[var(--accent)]">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {todayNotifications.length} new request{todayNotifications.length !== 1 ? "s" : ""} today
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Check your appointment requests below.
                </p>
              </div>
            )}
            {notifications.slice(0, 5).map((n) => (
              <div key={n.id} className="p-4 flex items-center gap-3">
                <span className="shrink-0 w-2 h-2 rounded-full bg-[var(--accent)]" />
                <div>
                  <p className="text-sm text-[var(--foreground)]">{n.message}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {new Date(n.createdAtISO).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Appointment requests */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Your appointment requests</h2>
        {appointments.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
            No appointment requests yet. When someone books with you, they’ll show up here.
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{a.name}</p>
                    <p className="text-sm text-[var(--muted)]">{a.contact}</p>
                  </div>
                  <time className="text-xs text-[var(--muted)] whitespace-nowrap">
                    {new Date(a.createdAtISO).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>
                    <span className="text-[var(--muted)]">Placement:</span>{" "}
                    <span className="text-[var(--foreground)]">{a.placement}</span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)]">Size:</span>{" "}
                    <span className="text-[var(--foreground)]">{a.size}</span>
                  </div>
                  {a.timeline && (
                    <div>
                      <span className="text-[var(--muted)]">Timeline:</span>{" "}
                      <span className="text-[var(--foreground)]">{a.timeline}</span>
                    </div>
                  )}
                  {a.budget && (
                    <div>
                      <span className="text-[var(--muted)]">Budget:</span>{" "}
                      <span className="text-[var(--foreground)]">{a.budget}</span>
                    </div>
                  )}
                </dl>
                <p className="mt-3 text-sm text-[var(--foreground)] border-t border-[var(--border)] pt-3">
                  {a.styleNotes}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
