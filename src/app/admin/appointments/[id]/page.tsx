"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (appointmentId) {
      loadAppointment();
    }
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`);
      const data = await res.json();
      setAppointment(data.appointment);
      setFormData({
        title: data.appointment?.title || "",
        startAt: data.appointment?.startAt
          ? format(new Date(data.appointment.startAt), "yyyy-MM-dd'T'HH:mm")
          : "",
        endAt: data.appointment?.endAt
          ? format(new Date(data.appointment.endAt), "yyyy-MM-dd'T'HH:mm")
          : "",
        status: data.appointment?.status || "tentative",
        notesCustomer: data.appointment?.notesCustomer || "",
        notesInternal: data.appointment?.notesInternal || "",
      });
    } catch (error) {
      console.error("Failed to load appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startAt: new Date(formData.startAt).toISOString(),
          endAt: new Date(formData.endAt).toISOString(),
        }),
      });

      if (res.ok) {
        setEditing(false);
        loadAppointment();
      }
    } catch (error) {
      console.error("Failed to update appointment:", error);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/appointments");
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12 text-[var(--muted)]">Loading...</div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12 text-[var(--muted)]">Appointment not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-[var(--accent)] hover:underline mb-4"
        >
          ← Back to Appointments
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {editing ? "Edit Appointment" : appointment.title}
          </h1>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false);
                    loadAppointment();
                  }}
                  className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Cancel Appointment
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Title</label>
            {editing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              />
            ) : (
              <p className="text-[var(--foreground)]">{appointment.title}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Status</label>
            {editing ? (
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              >
                <option value="tentative">Tentative</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            ) : (
              <p className="text-[var(--foreground)] capitalize">{appointment.status}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Start Time</label>
            {editing ? (
              <input
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              />
            ) : (
              <p className="text-[var(--foreground)]">
                {format(new Date(appointment.startAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">End Time</label>
            {editing ? (
              <input
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              />
            ) : (
              <p className="text-[var(--foreground)]">
                {format(new Date(appointment.endAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            )}
          </div>
        </div>

        {/* Customer Info */}
        {appointment.customer && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-3">Customer</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-[var(--muted)]">Name</dt>
                <dd className="text-[var(--foreground)]">{appointment.customer.name}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Email</dt>
                <dd className="text-[var(--foreground)]">{appointment.customer.email}</dd>
              </div>
              {appointment.customer.phone && (
                <div>
                  <dt className="text-[var(--muted)]">Phone</dt>
                  <dd className="text-[var(--foreground)]">{appointment.customer.phone}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Artist Info */}
        {appointment.artist && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-3">Artist</h3>
            <p className="text-[var(--foreground)]">{appointment.artist.name}</p>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted)] mb-2">
            Customer Notes
          </label>
          {editing ? (
            <textarea
              value={formData.notesCustomer}
              onChange={(e) => setFormData({ ...formData, notesCustomer: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
            />
          ) : (
            <p className="text-[var(--foreground)] whitespace-pre-wrap">
              {appointment.notesCustomer || "No notes"}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--muted)] mb-2">
            Internal Notes
          </label>
          {editing ? (
            <textarea
              value={formData.notesInternal}
              onChange={(e) => setFormData({ ...formData, notesInternal: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
            />
          ) : (
            <p className="text-[var(--foreground)] whitespace-pre-wrap">
              {appointment.notesInternal || "No notes"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
