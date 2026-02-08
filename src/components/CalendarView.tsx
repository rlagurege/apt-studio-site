"use client";

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";

type Appointment = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  artistId: string;
  artist?: { name: string };
  status: string;
};

type CalendarViewProps = {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onDateClick: (date: Date) => void;
  selectedDate?: Date;
};

export default function CalendarView({
  appointments,
  onAppointmentClick,
  onDateClick,
  selectedDate,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors"
          >
            Today
          </button>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-[var(--muted)] py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
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
              className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 rounded-lg border transition-colors cursor-pointer ${
                isCurrentMonth
                  ? isSelected
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : isToday
                    ? "border-[var(--accent)]/50 bg-[var(--accent)]/5"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/30"
                  : "border-transparent bg-transparent opacity-30"
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday ? "text-[var(--accent)]" : "text-[var(--foreground)]"
                }`}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(apt);
                    }}
                    className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent)] truncate hover:bg-[var(--accent)]/30 transition-colors"
                    title={apt.title}
                  >
                    {format(new Date(apt.startAt), "h:mm a")} - {apt.title}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-[var(--muted)] px-1.5">
                    +{dayAppointments.length - 3} more
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
