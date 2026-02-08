"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type Appointment = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: string;
  artist?: { name: string; email: string };
  customer?: { name: string; email: string; phone: string };
  location?: { name: string };
  service?: { name: string };
  notesCustomer?: string;
  notesInternal?: string;
};

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterArtist, setFilterArtist] = useState<string>("all");
  const [artists, setArtists] = useState<any[]>([]);

  useEffect(() => {
    loadAppointments();
    loadArtists();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadArtists = async () => {
    try {
      const res = await fetch("/api/users?role=artist");
      const data = await res.json();
      setArtists(data.users || []);
    } catch (error) {
      console.error("Failed to load artists:", error);
    }
  };

  const filtered = appointments.filter((apt) => {
    if (filterStatus !== "all" && apt.status !== filterStatus) return false;
    if (filterArtist !== "all" && apt.artist?.email !== filterArtist) return false;
    return true;
  });

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadAppointments();
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-500";
      case "tentative":
        return "bg-yellow-500/20 text-yellow-500";
      case "canceled":
        return "bg-red-500/20 text-red-500";
      case "completed":
        return "bg-blue-500/20 text-blue-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Appointments</h1>
        <p className="text-[var(--muted)]">Manage all scheduled appointments</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="tentative">Tentative</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
        </select>
        <select
          value={filterArtist}
          onChange={(e) => setFilterArtist(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="all">All Artists</option>
          {artists.map((artist) => (
            <option key={artist.id} value={artist.email}>
              {artist.name}
            </option>
          ))}
        </select>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
          No appointments found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt) => (
            <div
              key={apt.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 hover:border-[var(--accent)]/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/admin/appointments/${apt.id}`)}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">{apt.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(
                        apt.status
                      )}`}
                    >
                      {apt.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[var(--muted)]">
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {format(new Date(apt.startAt), "MMM d, yyyy")}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span>{" "}
                      {format(new Date(apt.startAt), "h:mm a")} -{" "}
                      {format(new Date(apt.endAt), "h:mm a")}
                    </div>
                    <div>
                      <span className="font-medium">Artist:</span> {apt.artist?.name || "TBD"}
                    </div>
                    <div>
                      <span className="font-medium">Customer:</span>{" "}
                      {apt.customer?.name || "Guest"}
                    </div>
                    {apt.location && (
                      <div>
                        <span className="font-medium">Location:</span> {apt.location.name}
                      </div>
                    )}
                    {apt.service && (
                      <div>
                        <span className="font-medium">Service:</span> {apt.service.name}
                      </div>
                    )}
                  </div>
                  {apt.notesCustomer && (
                    <p className="mt-3 text-sm text-[var(--foreground)] line-clamp-2">
                      {apt.notesCustomer}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/appointments/${apt.id}`);
                    }}
                    className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel(apt.id);
                    }}
                    className="px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
