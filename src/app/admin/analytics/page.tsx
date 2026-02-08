"use client";

import { useEffect, useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

type Stats = {
  totalAppointments: number;
  totalRequests: number;
  appointmentsByMonth: Array<{ month: string; count: number }>;
  appointmentsByArtist: Array<{ artist: string; count: number }>;
  requestsByStatus: Array<{ status: string; count: number }>;
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  useEffect(() => {
    loadStats();
  }, [selectedMonth]);

  const loadStats = async () => {
    try {
      const res = await fetch(`/api/analytics?month=${selectedMonth}`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12 text-[var(--muted)]">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Analytics Dashboard</h1>
        <p className="text-[var(--muted)]">View insights about appointments and requests</p>
      </div>

      {/* Month Selector */}
      <div className="mb-6">
        <label htmlFor="month-select" className="text-sm font-medium text-[var(--foreground)] mr-3">
          Select Month:
        </label>
        <input
          id="month-select"
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-medium text-[var(--muted)] mb-2">Total Appointments</h3>
          <p className="text-3xl font-bold text-[var(--foreground)]">
            {stats?.totalAppointments || 0}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-medium text-[var(--muted)] mb-2">Total Requests</h3>
          <p className="text-3xl font-bold text-[var(--foreground)]">
            {stats?.totalRequests || 0}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Artist */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Appointments by Artist
          </h3>
          <div className="space-y-3">
            {stats?.appointmentsByArtist.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--foreground)]">{item.artist}</span>
                  <span className="text-sm font-medium text-[var(--foreground)]">{item.count}</span>
                </div>
                <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] rounded-full transition-all"
                    style={{
                      width: `${
                        stats.totalAppointments > 0
                          ? (item.count / stats.totalAppointments) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requests by Status */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Requests by Status
          </h3>
          <div className="space-y-3">
            {stats?.requestsByStatus.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--foreground)] capitalize">
                    {item.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm font-medium text-[var(--foreground)]">{item.count}</span>
                </div>
                <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] rounded-full transition-all"
                    style={{
                      width: `${
                        stats.totalRequests > 0 ? (item.count / stats.totalRequests) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
