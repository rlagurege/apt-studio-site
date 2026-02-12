"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QuickActions() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleQuickSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/admin/customers?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Quick Actions</h2>
      
      {/* Quick Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Quick Search Customer
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleQuickSearch()}
            placeholder="Name, email, or phone..."
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
          />
          <button
            onClick={handleQuickSearch}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          href="/admin/dashboard?view=requests"
          className="px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-center text-sm font-medium"
        >
          <div className="text-lg mb-1">📋</div>
          <div>New Requests</div>
        </Link>
        
        <Link
          href="/admin/appointments"
          className="px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-center text-sm font-medium"
        >
          <div className="text-lg mb-1">📅</div>
          <div>Appointments</div>
        </Link>
        
        <Link
          href="/admin/customers"
          className="px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-center text-sm font-medium"
        >
          <div className="text-lg mb-1">👥</div>
          <div>Customers</div>
        </Link>
        
        <Link
          href="/admin/revenue"
          className="px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-center text-sm font-medium"
        >
          <div className="text-lg mb-1">💰</div>
          <div>Revenue</div>
        </Link>
        
        <Link
          href="/admin/analytics"
          className="px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-center text-sm font-medium"
        >
          <div className="text-lg mb-1">📊</div>
          <div>Analytics</div>
        </Link>
        
        <Link
          href="/admin/gallery"
          className="px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-center text-sm font-medium"
        >
          <div className="text-lg mb-1">🖼️</div>
          <div>Gallery</div>
        </Link>
        
        <Link
          href="/admin/waitlist"
          className="px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-center text-sm font-medium"
        >
          <div className="text-lg mb-1">⏳</div>
          <div>Waitlist</div>
        </Link>
        
        <Link
          href="/admin/settings"
          className="px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-center text-sm font-medium"
        >
          <div className="text-lg mb-1">⚙️</div>
          <div>Settings</div>
        </Link>
        
        <Link
          href="/appointments"
          className="px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-center text-sm font-medium"
        >
          <div className="text-lg mb-1">➕</div>
          <div>New Booking</div>
        </Link>
      </div>
    </div>
  );
}
