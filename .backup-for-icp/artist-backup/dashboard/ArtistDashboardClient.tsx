"use client";

import { useEffect, useState } from "react";
import { format, isToday, isSameDay, parseISO } from "date-fns";
import ImageUploadForm from "@/components/ImageUploadForm";
import CalendarView from "@/components/CalendarView";
import ArtistColorPicker from "@/components/ArtistColorPicker";
import AvailabilityManager from "@/components/AvailabilityManager";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";

type AppointmentRequest = {
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

type ScheduledAppointment = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: string;
  customerName: string;
  customerContact: string;
  location: string | null;
  service: string | null;
  notesCustomer: string | null;
  notesInternal: string | null;
  artistColor?: string | null;
};

type Notification = {
  id: string;
  type: string;
  message: string;
  createdAtISO: string;
  isToday: boolean;
};

type RequestsData = {
  appointments: AppointmentRequest[];
  notifications: Notification[];
};

type ScheduledData = {
  appointments: ScheduledAppointment[];
  todayAppointments: ScheduledAppointment[];
};

export default function ArtistDashboardClient({ artistSlug }: { artistSlug: string }) {
  const [requestsData, setRequestsData] = useState<RequestsData | null>(null);
  const [scheduledData, setScheduledData] = useState<ScheduledData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<ScheduledAppointment | null>(null);
  const [artistColor, setArtistColor] = useState<string | null>(null);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [artistId, setArtistId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/artist/appointments")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load requests");
          return res.json();
        })
        .catch(() => ({ appointments: [], notifications: [] })),
      fetch("/api/artist/scheduled")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load scheduled");
          return res.json();
        })
        .catch(() => ({ appointments: [], todayAppointments: [] })),
      fetch("/api/artist/all-appointments")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load all appointments");
          return res.json();
        })
        .catch(() => ({ appointments: [] })),
    ])
      .then(([requests, scheduled, allAppointments]) => {
        setRequestsData(requests);
        setScheduledData(scheduled);
        // Set artist color from first appointment if available
        if (scheduled?.appointments?.[0]?.artistColor) {
          setArtistColor(scheduled.appointments[0].artistColor);
        }
        // Store all appointments for calendar view
        setAllAppointments(allAppointments.appointments || []);
        // Get artist ID from scheduled response
        if (scheduled?.artistId) {
          setArtistId(scheduled.artistId);
        } else {
          // Fallback: get from appointments
          const myAppointment = scheduled?.appointments?.[0] || allAppointments.appointments?.find((apt: any) => 
            apt.artist?.email?.includes(artistSlug)
          );
          if (myAppointment?.artistId || myAppointment?.artist?.id) {
            setArtistId(myAppointment.artistId || myAppointment.artist?.id);
          }
        }
      })
      .catch(() => setError("Could not load data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Fetch artist color if not set from appointments
    if (!artistColor) {
      fetch(`/api/artist/color?slug=${artistSlug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.color) {
            setArtistColor(data.color);
          }
        })
        .catch(() => {
          // Silently fail - color is optional
        });
    }
  }, [artistSlug, artistColor]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
        <p className="mt-4">Loading your dashboard...</p>
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

  const requests = requestsData?.appointments ?? [];
  const notifications = requestsData?.notifications ?? [];
  const scheduledAppointments = scheduledData?.appointments ?? [];
  const todayAppointments = scheduledData?.todayAppointments ?? [];
  const todayNotifications = notifications.filter((n) => n.isToday);

  // Convert ALL appointments to calendar format (shows all artists with their colors)
  const calendarAppointments = allAppointments.map((apt) => ({
    id: apt.id,
    title: apt.title,
    startAt: apt.startAt,
    endAt: apt.endAt,
    artistId: apt.artist?.id || "",
    status: apt.status,
    customerName: apt.customerName,
    artist: {
      name: apt.artist?.name || "Unknown",
      color: apt.artist?.color || null,
    },
  }));

  return (
    <div className="space-y-8">
      {/* Today's Appointments - Modern Card Design */}
      {todayAppointments.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Today's Schedule</h2>
            <span className="px-3 py-1 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium">
              {todayAppointments.length} appointment{todayAppointments.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todayAppointments.map((apt) => {
              const startTime = parseISO(apt.startAt);
              const endTime = parseISO(apt.endAt);
              const isUpcoming = startTime > new Date();
              const isPast = endTime < new Date();
              const isNow = startTime <= new Date() && endTime >= new Date();

              return (
                <div
                  key={apt.id}
                  className={`rounded-xl border-2 p-5 transition-all hover:shadow-lg ${
                    isNow
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-lg shadow-[var(--accent)]/20"
                      : isUpcoming
                      ? "border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/50"
                      : "border-[var(--border)] bg-[var(--card)] opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--foreground)] text-lg mb-1">{apt.title}</h3>
                      <p className="text-sm text-[var(--muted)]">{apt.customerName}</p>
                    </div>
                    {isNow && (
                      <span className="px-2 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-medium animate-pulse">
                        Now
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[var(--foreground)] font-medium">
                        {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                      </span>
                    </div>
                    {apt.location && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[var(--muted)]">{apt.location}</span>
                      </div>
                    )}
                    {apt.customerContact && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-[var(--muted)]">{apt.customerContact}</span>
                      </div>
                    )}
                    {apt.notesCustomer && (
                      <p className="mt-3 pt-3 border-t border-[var(--border)] text-[var(--foreground)] text-xs">
                        {apt.notesCustomer}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Calendar View */}
      <section className="space-y-6" data-section="calendar">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Studio Calendar</h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              View all appointments. Each color represents a different artist.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                // Scroll to color picker section
                document.getElementById("color-picker")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors"
            >
              Choose My Color
            </button>
          </div>
        </div>

        {/* Availability Manager */}
        {artistId && (
          <AvailabilityManager
            artistId={artistId}
            onBlockCreated={() => {
              // Reload appointments if needed
            }}
          />
        )}

        <CalendarView
          appointments={calendarAppointments}
          onAppointmentClick={(apt) => {
            // Find appointment in all appointments or scheduled appointments
            const found = allAppointments.find((a) => a.id === apt.id) || 
                         scheduledAppointments.find((a) => a.id === apt.id);
            if (found) {
              setSelectedAppointment({
                id: found.id,
                title: found.title,
                startAt: found.startAt,
                endAt: found.endAt,
                status: found.status,
                customerName: found.customerName || apt.customerName,
                customerContact: found.customerContact || "",
                location: found.location,
                service: found.service,
                notesCustomer: found.notesCustomer,
                notesInternal: found.notesInternal,
              });
            }
          }}
          onDateClick={(date) => setSelectedDate(date)}
          selectedDate={selectedDate || undefined}
        />
      </section>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">{selectedAppointment.title}</h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1 rounded-lg hover:bg-[var(--surface)] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-[var(--muted)]">Customer:</span>{" "}
                <span className="text-[var(--foreground)] font-medium">{selectedAppointment.customerName}</span>
              </div>
              <div>
                <span className="text-[var(--muted)]">Time:</span>{" "}
                <span className="text-[var(--foreground)]">
                  {format(parseISO(selectedAppointment.startAt), "MMM d, yyyy h:mm a")} -{" "}
                  {format(parseISO(selectedAppointment.endAt), "h:mm a")}
                </span>
              </div>
              {selectedAppointment.location && (
                <div>
                  <span className="text-[var(--muted)]">Location:</span>{" "}
                  <span className="text-[var(--foreground)]">{selectedAppointment.location}</span>
                </div>
              )}
              {selectedAppointment.service && (
                <div>
                  <span className="text-[var(--muted)]">Service:</span>{" "}
                  <span className="text-[var(--foreground)]">{selectedAppointment.service}</span>
                </div>
              )}
              {selectedAppointment.customerContact && (
                <div>
                  <span className="text-[var(--muted)]">Contact:</span>{" "}
                  <span className="text-[var(--foreground)]">{selectedAppointment.customerContact}</span>
                </div>
              )}
              {selectedAppointment.notesCustomer && (
                <div className="pt-3 border-t border-[var(--border)]">
                  <span className="text-[var(--muted)] block mb-1">Customer Notes:</span>
                  <p className="text-[var(--foreground)]">{selectedAppointment.notesCustomer}</p>
                </div>
              )}
              {selectedAppointment.notesInternal && (
                <div className="pt-3 border-t border-[var(--border)]">
                  <span className="text-[var(--muted)] block mb-1">Internal Notes:</span>
                  <p className="text-[var(--foreground)]">{selectedAppointment.notesInternal}</p>
                </div>
              )}
              {/* Show which artist this appointment belongs to */}
              {(() => {
                const apt = allAppointments.find((a) => a.id === selectedAppointment.id);
                if (apt?.artist) {
                  return (
                    <div className="pt-3 border-t border-[var(--border)]">
                      <span className="text-[var(--muted)] block mb-1">Artist:</span>
                      <div className="flex items-center gap-2">
                        {apt.artist.color && (
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: apt.artist.color }}
                          />
                        )}
                        <span className="text-[var(--foreground)] font-medium">{apt.artist.name}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              <div className="pt-4 border-t border-[var(--border)] flex gap-2">
                {selectedAppointment.status === "tentative" && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/appointments/${selectedAppointment.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "confirmed" }),
                        });
                        if (res.ok) {
                          // Refresh appointments
                          const scheduledRes = await fetch("/api/artist/scheduled");
                          const scheduled = await scheduledRes.json();
                          setScheduledData(scheduled);
                          setSelectedAppointment({ ...selectedAppointment, status: "confirmed" });
                        }
                      } catch (error) {
                        console.error("Failed to confirm appointment:", error);
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                  >
                    ✓ Confirm Appointment
                  </button>
                )}
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {(todayNotifications.length > 0 || notifications.length > 0) && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Notifications</h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]">
            {todayNotifications.length > 0 && (
              <div className="p-4 bg-[var(--accent)]/10 border-l-4 border-[var(--accent)]">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {todayNotifications.length} new request{todayNotifications.length !== 1 ? "s" : ""} today
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">Check your appointment requests below.</p>
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

      {/* Artist Color Picker */}
      <section id="color-picker">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">My Calendar Color</h2>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
          <p className="text-sm text-[var(--muted)] mb-4">
            Choose a color to identify your appointments on the calendar. Each artist has their own color, so you can easily see who has which appointment scheduled.
          </p>
          <ArtistColorPicker artistSlug={artistSlug} currentColor={artistColor} onColorChange={setArtistColor} />
        </div>
      </section>

      {/* Image Upload Section */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Add to Gallery</h2>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
          <ImageUploadForm />
        </div>
      </section>

      {/* Appointment Requests */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Appointment Requests</h2>
        {requests.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
            No appointment requests yet. When someone books with you, they'll show up here.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 hover:border-[var(--accent)]/50 transition-colors"
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
