"use client";

import { useState, useMemo, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";

type Appointment = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  artistId: string;
  artist?: { name: string; color?: string | null };
  status: string;
  customerName?: string;
};

type CalendarViewProps = {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onDateClick: (date: Date) => void;
  selectedDate?: Date;
  artistColor?: string; // Deprecated - colors now show which artist owns each appointment
};

// Status display names and colors
const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  tentative: { label: "Pending", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  confirmed: { label: "Confirmed", color: "text-green-600", bgColor: "bg-green-100" },
  checked_in: { label: "Checked In", color: "text-blue-600", bgColor: "bg-blue-100" },
  completed: { label: "Done", color: "text-gray-600", bgColor: "bg-gray-100" },
  canceled: { label: "Canceled", color: "text-red-600", bgColor: "bg-red-100" },
  no_show: { label: "No Show", color: "text-orange-600", bgColor: "bg-orange-100" },
};

export default function CalendarView({
  appointments,
  onAppointmentClick,
  onDateClick,
  selectedDate,
  artistColor,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach((apt) => {
      const dateKey = format(new Date(apt.startAt), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt);
    });
    return grouped;
  }, [appointments]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || { label: status, color: "text-gray-600", bgColor: "bg-gray-100" };
  };

  const getAppointmentColor = (apt: Appointment) => {
    // Use artist's color if available, otherwise use status color
    if (apt.artist?.color) {
      return apt.artist.color;
    }
    // Default colors based on status
    const statusColors: Record<string, string> = {
      confirmed: "#10b981", // green
      tentative: "#f59e0b", // yellow
      completed: "#6b7280", // gray
      canceled: "#ef4444", // red
    };
    return statusColors[apt.status] || "#6366f1"; // default indigo
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-[var(--surface)] transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors"
          >
            Today
          </button>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-[var(--surface)] transition-colors"
          aria-label="Next month"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Names - Bigger, Bubbly, Modern */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center py-3 px-2 rounded-2xl bg-gradient-to-br from-[var(--surface)] to-[var(--card)] border border-[var(--border)]/50 shadow-sm"
          >
            <div className="text-base font-bold text-[var(--foreground)]">{day}</div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayAppointments = appointmentsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <div
              key={idx}
              onClick={() => onDateClick(day)}
              className={`min-h-[80px] sm:min-h-[100px] md:min-h-[120px] p-1.5 sm:p-2 rounded-xl border-2 transition-all cursor-pointer touch-manipulation active:scale-[0.98] ${
                isCurrentMonth
                  ? isSelected
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-md scale-[1.02]"
                    : isToday
                    ? "border-[var(--accent)]/60 bg-[var(--accent)]/5 shadow-sm"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/40 hover:shadow-sm active:border-[var(--accent)]/60"
                  : "border-transparent bg-transparent opacity-30"
              }`}
            >
              <div
                className={`text-sm font-bold mb-2 ${
                  isToday
                    ? "text-[var(--accent)] text-lg"
                    : isSelected
                    ? "text-[var(--foreground)]"
                    : "text-[var(--foreground)]"
                }`}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                {dayAppointments.slice(0, isMobile ? 2 : 3).map((apt) => {
                  const statusInfo = getStatusInfo(apt.status);
                  const aptColor = getAppointmentColor(apt);
                  const artistName = apt.artist?.name || "Unknown";

                  return (
                    <div
                      key={apt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(apt);
                      }}
                      className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg font-medium truncate hover:opacity-80 active:opacity-60 transition-all cursor-pointer shadow-sm touch-manipulation"
                      style={{
                        backgroundColor: `${aptColor}20`,
                        color: aptColor,
                        borderLeft: `3px solid ${aptColor}`,
                      }}
                      title={`${format(new Date(apt.startAt), "h:mm a")} - ${apt.title}${apt.customerName ? ` - ${apt.customerName}` : ""} - ${artistName}`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">
                          {format(new Date(apt.startAt), "h:mm")}
                        </span>
                        <span className="truncate">{apt.title}</span>
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        {apt.customerName && (
                          <div className="text-[10px] opacity-75 truncate flex-1">
                            {apt.customerName}
                          </div>
                        )}
                        <div className="text-[10px] font-bold opacity-90" style={{ color: aptColor }}>
                          {artistName}
                        </div>
                      </div>
                      <div className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mt-1 ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </div>
                    </div>
                  );
                })}
                {dayAppointments.length > (isMobile ? 2 : 3) && (
                  <div className="text-[10px] sm:text-xs text-[var(--muted)] px-1.5 sm:px-2 py-0.5 sm:py-1 font-medium">
                    +{dayAppointments.length - (isMobile ? 2 : 3)} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
