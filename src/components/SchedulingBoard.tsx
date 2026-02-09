"use client";

import { useEffect, useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfDay, addDays } from "date-fns";
import CalendarView from "./CalendarView";
import ScheduleModal from "./ScheduleModal";
import Link from "next/link";

type Appointment = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: string;
  artist?: { id: string; name: string; email: string };
  customer?: { id: string; name: string; email: string; phone: string };
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  location?: { name: string };
  service?: { name: string };
  notesCustomer?: string;
  notesInternal?: string;
};

type ViewMode = "calendar" | "list" | "week" | "day";

export default function SchedulingBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [filterArtist, setFilterArtist] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [artists, setArtists] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(new Date());

  useEffect(() => {
    loadAppointments();
    loadArtists();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
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

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (filterArtist !== "all" && apt.artist?.id !== filterArtist) return false;
      if (filterStatus !== "all" && apt.status !== filterStatus) return false;
      return true;
    });
  }, [appointments, filterArtist, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "tentative":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "canceled":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
  };

  const getArtistColor = (artistId: string) => {
    const colors = [
      "bg-red-500/20 border-red-500/50",
      "bg-blue-500/20 border-blue-500/50",
      "bg-green-500/20 border-green-500/50",
      "bg-purple-500/20 border-purple-500/50",
      "bg-orange-500/20 border-orange-500/50",
      "bg-pink-500/20 border-pink-500/50",
    ];
    const index = artists.findIndex((a) => a.id === artistId);
    return colors[index % colors.length] || "bg-gray-500/20 border-gray-500/50";
  };

  const handleScheduleSuccess = () => {
    loadAppointments();
    setScheduleModalOpen(false);
    setSelectedDate(null);
    setSelectedRequestId(null);
  };

  // Week view helpers
  const weekStart = startOfWeek(currentWeek);
  const weekEnd = endOfWeek(currentWeek);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const appointmentsByDay = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    filteredAppointments.forEach((apt) => {
      const dateKey = format(new Date(apt.startAt), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt);
    });
    return grouped;
  }, [filteredAppointments]);

  // Day view helpers
  const dayAppointments = useMemo(() => {
    const dateKey = format(currentDay, "yyyy-MM-dd");
    return (appointmentsByDay[dateKey] || []).sort((a, b) => {
      return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
    });
  }, [appointmentsByDay, currentDay]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
          Loading schedule...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Scheduling Board</h1>
            <p className="text-[var(--muted)]">View and manage all appointments</p>
          </div>
          <button
            onClick={() => {
              setSelectedRequestId(null);
              setSelectedDate(null);
              setScheduleModalOpen(true);
            }}
            className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            + New Appointment
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "calendar"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]"
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "week"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode("day")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "day"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]"
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]"
            }`}
          >
            List
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filterArtist}
            onChange={(e) => setFilterArtist(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="all">All Artists</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
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
          <div className="text-sm text-[var(--muted)]">
            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="mb-8">
          <CalendarView
            appointments={filteredAppointments.map((apt) => ({
              id: apt.id,
              title: apt.title,
              startAt: apt.startAt,
              endAt: apt.endAt,
              artistId: apt.artist?.id || "",
              artist: apt.artist,
              status: apt.status,
            }))}
            onAppointmentClick={(apt) => {
              window.location.href = `/admin/appointments/${apt.id}`;
            }}
            onDateClick={(date) => {
              setSelectedDate(date);
              setSelectedRequestId(null);
              setScheduleModalOpen(true);
            }}
          />
        </div>
      )}

      {/* Week View */}
      {viewMode === "week" && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </h2>
            <button
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayApts = appointmentsByDay[dateKey] || [];
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={dateKey}
                  className={`min-h-[200px] p-2 rounded-lg border ${
                    isToday
                      ? "border-[var(--accent)] bg-[var(--accent)]/5"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  <div className={`text-sm font-medium mb-2 ${isToday ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>
                    {format(day, "EEE d")}
                  </div>
                  <div className="space-y-1.5">
                    {dayApts.map((apt) => (
                      <Link
                        key={apt.id}
                        href={`/admin/appointments/${apt.id}`}
                        className={`block p-2 rounded border text-xs ${getArtistColor(apt.artist?.id || "")} hover:opacity-80 transition-opacity`}
                      >
                        <div className="font-medium truncate">{apt.title}</div>
                        <div className="text-[10px] opacity-80">
                          {format(new Date(apt.startAt), "h:mm a")}
                        </div>
                        <div className="text-[10px] opacity-80 truncate">
                          {apt.customer?.name || apt.guestName || "Guest"}
                        </div>
                        <div className="text-[10px] opacity-80 truncate">
                          {apt.artist?.name || "TBD"}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === "day" && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDay(addDays(currentDay, -1))}
              className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                {format(currentDay, "EEEE, MMMM d, yyyy")}
              </h2>
              <button
                onClick={() => setCurrentDay(new Date())}
                className="px-3 py-1 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors"
              >
                Today
              </button>
            </div>
            <button
              onClick={() => setCurrentDay(addDays(currentDay, 1))}
              className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="space-y-3">
            {dayAppointments.length === 0 ? (
              <div className="text-center py-12 text-[var(--muted)]">
                No appointments scheduled for this day
              </div>
            ) : (
              dayAppointments.map((apt) => (
                <Link
                  key={apt.id}
                  href={`/admin/appointments/${apt.id}`}
                  className={`block p-4 rounded-xl border ${getArtistColor(apt.artist?.id || "")} hover:opacity-80 transition-opacity`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-semibold text-[var(--foreground)]">{apt.title}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-[var(--muted)]">Time:</span>{" "}
                          <span className="text-[var(--foreground)] font-medium">
                            {format(new Date(apt.startAt), "h:mm a")} - {format(new Date(apt.endAt), "h:mm a")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--muted)]">Client:</span>{" "}
                          <span className="text-[var(--foreground)] font-medium">
                            {apt.customer?.name || apt.guestName || "Guest"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--muted)]">Artist:</span>{" "}
                          <span className="text-[var(--foreground)] font-medium">
                            {apt.artist?.name || "TBD"}
                          </span>
                        </div>
                        {apt.location && (
                          <div>
                            <span className="text-[var(--muted)]">Location:</span>{" "}
                            <span className="text-[var(--foreground)]">{apt.location.name}</span>
                          </div>
                        )}
                      </div>
                      {apt.notesCustomer && (
                        <p className="mt-2 text-sm text-[var(--foreground)] line-clamp-2">{apt.notesCustomer}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
              No appointments found.
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <Link
                key={apt.id}
                href={`/admin/appointments/${apt.id}`}
                className={`block p-5 rounded-xl border ${getArtistColor(apt.artist?.id || "")} hover:opacity-80 transition-opacity`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">{apt.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-[var(--muted)] block text-xs">Date & Time</span>
                        <span className="text-[var(--foreground)] font-medium">
                          {format(new Date(apt.startAt), "MMM d, yyyy")}
                        </span>
                        <br />
                        <span className="text-[var(--foreground)]">
                          {format(new Date(apt.startAt), "h:mm a")} - {format(new Date(apt.endAt), "h:mm a")}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--muted)] block text-xs">Client</span>
                        <span className="text-[var(--foreground)] font-medium">
                          {apt.customer?.name || apt.guestName || "Guest"}
                        </span>
                        {(apt.customer?.phone || apt.guestPhone) && (
                          <div className="text-xs text-[var(--muted)] mt-1">
                            {apt.customer?.phone || apt.guestPhone}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[var(--muted)] block text-xs">Artist</span>
                        <span className="text-[var(--foreground)] font-medium">
                          {apt.artist?.name || "TBD"}
                        </span>
                      </div>
                      {apt.location && (
                        <div>
                          <span className="text-[var(--muted)] block text-xs">Location</span>
                          <span className="text-[var(--foreground)]">{apt.location.name}</span>
                        </div>
                      )}
                    </div>
                    {apt.notesCustomer && (
                      <p className="mt-3 text-sm text-[var(--foreground)] line-clamp-2">{apt.notesCustomer}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModalOpen && (
        <ScheduleModal
          isOpen={scheduleModalOpen}
          requestId={selectedRequestId}
          initialDate={selectedDate || undefined}
          onClose={() => {
            setScheduleModalOpen(false);
            setSelectedDate(null);
            setSelectedRequestId(null);
          }}
          onSuccess={handleScheduleSuccess}
        />
      )}
    </div>
  );
}
