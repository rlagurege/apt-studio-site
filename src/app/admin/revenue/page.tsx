"use client";

import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import Link from "next/link";

type RevenueStats = {
  totalRevenue: number;
  totalDeposits: number;
  completedAppointments: number;
  pendingDeposits: number;
  thisMonth: {
    revenue: number;
    deposits: number;
    appointments: number;
  };
  lastMonth: {
    revenue: number;
    deposits: number;
    appointments: number;
  };
};

export default function RevenuePage() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"month" | "year">("month");

  useEffect(() => {
    loadRevenueStats();
  }, [selectedPeriod]);

  const loadRevenueStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/revenue?period=${selectedPeriod}`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to load revenue stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12 text-[var(--muted)]">Loading revenue data...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12 text-[var(--muted)]">No revenue data available</div>
      </div>
    );
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const revenueChange = stats.thisMonth.revenue - stats.lastMonth.revenue;
  const revenueChangePercent =
    stats.lastMonth.revenue > 0
      ? ((revenueChange / stats.lastMonth.revenue) * 100).toFixed(1)
      : "0";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Revenue Dashboard</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Track earnings, deposits, and appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as "month" | "year")}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <Link
            href="/admin/dashboard"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="text-sm text-[var(--muted)] mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-xs text-[var(--muted)] mt-2">
            {revenueChange >= 0 ? (
              <span className="text-green-500">↑ {formatCurrency(revenueChange)} ({revenueChangePercent}%)</span>
            ) : (
              <span className="text-red-500">↓ {formatCurrency(Math.abs(revenueChange))} ({revenueChangePercent}%)</span>
            )}
            {" "}vs last month
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="text-sm text-[var(--muted)] mb-1">Total Deposits</div>
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {formatCurrency(stats.totalDeposits)}
          </div>
          <div className="text-xs text-[var(--muted)] mt-2">
            {stats.pendingDeposits > 0 && (
              <span className="text-yellow-500">{stats.pendingDeposits} pending</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="text-sm text-[var(--muted)] mb-1">Completed Appointments</div>
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {stats.completedAppointments}
          </div>
          <div className="text-xs text-[var(--muted)] mt-2">
            {stats.thisMonth.appointments} this month
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="text-sm text-[var(--muted)] mb-1">This Month Revenue</div>
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {formatCurrency(stats.thisMonth.revenue)}
          </div>
          <div className="text-xs text-[var(--muted)] mt-2">
            {stats.thisMonth.appointments} appointments
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 mb-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Monthly Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-[var(--muted)] mb-2">This Month</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Revenue:</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {formatCurrency(stats.thisMonth.revenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Deposits:</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {formatCurrency(stats.thisMonth.deposits)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Appointments:</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {stats.thisMonth.appointments}
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm text-[var(--muted)] mb-2">Last Month</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Revenue:</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {formatCurrency(stats.lastMonth.revenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Deposits:</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {formatCurrency(stats.lastMonth.deposits)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Appointments:</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {stats.lastMonth.appointments}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/appointments"
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-sm font-medium"
          >
            View All Appointments
          </Link>
          <Link
            href="/admin/customers"
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-sm font-medium"
          >
            View Customers
          </Link>
          <Link
            href="/admin/analytics"
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-sm font-medium"
          >
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}
