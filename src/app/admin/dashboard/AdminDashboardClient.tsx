"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ScheduleModal from "@/components/ScheduleModal";
import RequestDetailModal from "@/components/RequestDetailModal";
import CalendarView from "@/components/CalendarView";

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

type Data = {
  appointments: Appointment[];
};

export default function AdminDashboardClient() {
  const [data, setData] = useState<Data | null>(null);
  const [rawRequests, setRawRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<string>("all");
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [reminderMessage, setReminderMessage] = useState<{ [key: string]: string }>({});
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequestTitle, setSelectedRequestTitle] = useState<string>("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [requestDetailOpen, setRequestDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadRequests = () => {
    setLoading(true);
    fetch("/api/requests")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        const requests = data.requests || [];
        setRawRequests(requests);
        // Transform the data to match the expected format
        const transformed = {
          appointments: requests.map((r: any) => ({
            id: r.id,
            createdAtISO: r.createdAt,
            artistSlug: r.preferredArtist?.email?.split("@")[0] || "unknown",
            name: r.customer?.name || r.guestName || "Unknown",
            contact: r.customer?.email || r.customer?.phone || r.guestEmail || r.guestPhone || "",
            placement: r.placement || "",
            size: r.sizeNotes || "",
            styleNotes: r.description || "",
            budget: r.budgetMinCents ? `$${(r.budgetMinCents / 100).toFixed(0)}${r.budgetMaxCents ? `-$${(r.budgetMaxCents / 100).toFixed(0)}` : ""}` : undefined,
            timeline: undefined,
            status: r.status,
            rawRequest: r,
          })),
        };
        setData(transformed);
      })
      .catch(() => setError("Could not load requests."))
      .finally(() => setLoading(false));
  };

  const loadAppointments = async () => {
    setAppointmentsLoading(true);
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    loadAppointments();
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
  const filtered = appointments.filter((a) => {
    // Artist filter
    if (selectedArtist !== "all" && a.artistSlug !== selectedArtist) return false;
    // Status filter
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = a.name.toLowerCase();
      const contact = a.contact.toLowerCase();
      const placement = a.placement.toLowerCase();
      const styleNotes = a.styleNotes.toLowerCase();
      if (!name.includes(query) && !contact.includes(query) && !placement.includes(query) && !styleNotes.includes(query)) {
        return false;
      }
    }
    return true;
  });

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\D/g, "")}`;
  };

  const handleText = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hi ${name}, this is Tammy from APT Studio. We're confirming your appointment request.`);
    window.location.href = `sms:${phone.replace(/\D/g, "")}?body=${message}`;
  };

  const handleSendReminder = async (appointmentId: string, type: "confirmation" | "reminder" | "followup", customMessage?: string) => {
    setSendingReminder(appointmentId);
    try {
      const res = await fetch("/api/admin/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          reminderType: type,
          customMessage: customMessage || reminderMessage[appointmentId],
        }),
      });

      const result = await res.json();
      if (result.success) {
        setNotification({ type: "success", message: `Reminder sent successfully to ${result.sentTo}` });
        setReminderMessage((prev) => {
          const next = { ...prev };
          delete next[appointmentId];
          return next;
        });
      } else {
        setNotification({ type: "error", message: `Failed to send reminder: ${result.error || "Unknown error"}` });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to send reminder. Please check Twilio configuration." });
    } finally {
      setSendingReminder(null);
    }
  };

  const handleSchedule = (requestId: string, requestTitle?: string) => {
    setSelectedRequestId(requestId);
    setSelectedRequestTitle(requestTitle || "");
    setScheduleModalOpen(true);
  };

  const handleScheduleSuccess = () => {
    loadRequests(); // Refresh the list without full page reload
    loadAppointments(); // Refresh appointments for calendar
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadRequests();
        setNotification({ type: "success", message: "Status updated successfully" });
      } else {
        setNotification({ type: "error", message: "Failed to update status" });
      }
    } catch (error) {
      setNotification({ type: "error", message: "Failed to update status" });
    }
  };

  const handleRequestClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setRequestDetailOpen(true);
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSendSMS = async (phone: string, message: string) => {
    try {
      const res = await fetch("/api/admin/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sms", phone, message }),
      });

      const result = await res.json();
      if (result.success) {
        setNotification({ type: "success", message: "SMS sent successfully!" });
      } else {
        setNotification({ type: "error", message: `Failed to send SMS: ${result.error || "Unknown error"}` });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to send SMS. Please check Twilio configuration." });
    }
  };

  const handleMakeCall = async (phone: string, message: string) => {
    try {
      const res = await fetch("/api/admin/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "call", phone, message }),
      });

      const result = await res.json();
      if (result.success) {
        setNotification({ type: "success", message: "Call initiated successfully!" });
      } else {
        setNotification({ type: "error", message: `Failed to make call: ${result.error || "Unknown error"}` });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to make call. Please check Twilio configuration." });
    }
  };

  const isPhone = (contact: string) => /[\d-()]/.test(contact);

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`rounded-xl border p-4 text-sm text-center ${
            notification.type === "success"
              ? "border-green-600/50 bg-green-900/30 text-green-200"
              : "border-red-600/50 bg-red-900/30 text-red-200"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--muted)]">Total Requests</p>
          <p className="text-2xl font-semibold text-[var(--foreground)]">{appointments.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--muted)]">Pending</p>
          <p className="text-2xl font-semibold text-[var(--foreground)]">{appointments.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--muted)]">This Week</p>
          <p className="text-2xl font-semibold text-[var(--foreground)]">
            {appointments.filter((a) => {
              const date = new Date(a.createdAtISO);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return date >= weekAgo;
            }).length}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email, phone, placement, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 pl-10 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* View Mode Toggle & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]"
              }`}
            >
              Calendar
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="status-filter" className="text-sm font-medium text-[var(--foreground)]">
              Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="requested">Requested</option>
              <option value="contacting">Contacting</option>
              <option value="needs_photos">Needs Photos</option>
              <option value="scheduled">Scheduled</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
              <option value="archived">Archived</option>
            </select>
            <label htmlFor="artist-filter" className="text-sm font-medium text-[var(--foreground)]">
              Artist:
            </label>
            <select
              id="artist-filter"
              value={selectedArtist}
              onChange={(e) => setSelectedArtist(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
            >
              <option value="all">All Artists</option>
              <option value="big-russ">Big Russ</option>
              <option value="kenny-briggs">Kenny Briggs</option>
              <option value="kade-zapp">Kade Zapp</option>
              <option value="chris-cross">Chris Cross</option>
              <option value="marissa-millington">Marisa K Millington</option>
              <option value="brian-langer">Brian Langer</option>
              <option value="tom-bone">Tom-Bone</option>
              <option value="ron-holt">Ron Holt</option>
              <option value="gavin-gomula">Gavin Gomula</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Calendar View</h2>
          <CalendarView
            appointments={appointments.map((apt) => ({
              id: apt.id,
              title: apt.title,
              startAt: apt.startAt,
              endAt: apt.endAt,
              artistId: apt.artistId,
              artist: apt.artist,
              status: apt.status,
            }))}
            onAppointmentClick={(apt) => {
              // Open appointment detail
              window.location.href = `/admin/appointments/${apt.id}`;
            }}
            onDateClick={(date) => {
              // Could filter requests by date or create new appointment
            }}
          />
        </section>
      )}

      {/* Appointment Requests */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Appointment Requests</h2>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
            No appointment requests {selectedArtist !== "all" ? "for this artist" : ""}.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 cursor-pointer hover:border-[var(--accent)]/50 transition-colors"
                onClick={() => handleRequestClick(a.id)}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">{a.name}</p>
                    <p className="text-sm text-[var(--muted)]">{a.contact}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      Artist: <span className="capitalize">{a.artistSlug.replace(/-/g, " ")}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <time className="text-xs text-[var(--muted)] whitespace-nowrap">
                      {new Date(a.createdAtISO).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </time>
                    {isPhone(a.contact) && (
                      <div className="flex flex-col gap-2 items-end">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCall(a.contact)}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500"
                          >
                            Call
                          </button>
                          <button
                            onClick={() => handleText(a.contact, a.name)}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
                          >
                            Text
                          </button>
                        </div>
                        <div className="flex gap-1 flex-wrap justify-end">
                          <button
                            onClick={() => handleSchedule(a.id, `${a.name} - ${a.placement}`)}
                            className="rounded-lg bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-500"
                          >
                            Schedule
                          </button>
                          <button
                            onClick={() => handleSendReminder(a.id, "confirmation")}
                            disabled={sendingReminder === a.id}
                            className="rounded-lg bg-purple-600 px-2 py-1 text-xs font-medium text-white hover:bg-purple-500 disabled:opacity-50"
                          >
                            {sendingReminder === a.id ? "Sending..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => handleSendReminder(a.id, "reminder")}
                            disabled={sendingReminder === a.id}
                            className="rounded-lg bg-orange-600 px-2 py-1 text-xs font-medium text-white hover:bg-orange-500 disabled:opacity-50"
                          >
                            Remind
                          </button>
                          <button
                            onClick={() => handleSendReminder(a.id, "followup")}
                            disabled={sendingReminder === a.id}
                            className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                          >
                            Follow up
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
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
                <p className="text-sm text-[var(--foreground)] border-t border-[var(--border)] pt-3 mb-3">
                  {a.styleNotes}
                </p>
                {isPhone(a.contact) && (
                  <div className="border-t border-[var(--border)] pt-3">
                    <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                      Custom message (optional):
                    </label>
                    <textarea
                      value={reminderMessage[a.id] || ""}
                      onChange={(e) => setReminderMessage((prev) => ({ ...prev, [a.id]: e.target.value }))}
                      placeholder="Enter custom message for SMS reminder..."
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                      rows={2}
                    />
                    <button
                      onClick={() => {
                        const msg = reminderMessage[a.id] || `Hi ${a.name}, this is Tammy from APT Studio regarding your appointment request.`;
                        handleSendSMS(a.contact, msg);
                      }}
                      className="mt-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
                    >
                      Send Custom SMS
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Schedule Modal */}
      {scheduleModalOpen && selectedRequestId && (
        <ScheduleModal
          isOpen={scheduleModalOpen}
          requestId={selectedRequestId}
          requestTitle={selectedRequestTitle}
          onClose={() => {
            setScheduleModalOpen(false);
            setSelectedRequestId(null);
            setSelectedRequestTitle("");
          }}
          onSuccess={handleScheduleSuccess}
        />
      )}

      {/* Request Detail Modal */}
      {requestDetailOpen && selectedRequestId && (
        <RequestDetailModal
          isOpen={requestDetailOpen}
          requestId={selectedRequestId}
          onClose={() => {
            setRequestDetailOpen(false);
            setSelectedRequestId(null);
          }}
          onSchedule={(requestId) => {
            setRequestDetailOpen(false);
            setSelectedRequestTitle("");
            setScheduleModalOpen(true);
          }}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
