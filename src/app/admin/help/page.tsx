"use client";

import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Admin Dashboard Guide</h1>
        <p className="text-[var(--muted)]">Learn how to use the APT Studio admin dashboard</p>
      </div>

      <div className="space-y-6">
        {/* Overview Tab */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Overview Tab</h2>
          <div className="space-y-3 text-sm text-[var(--muted)]">
            <p>
              The Overview tab gives you a quick snapshot of your studio's activity:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Today's Appointments:</strong> See all appointments scheduled for today</li>
              <li><strong>Recent Requests:</strong> View the latest appointment requests that need attention</li>
              <li><strong>Quick Actions:</strong> Call, text, or schedule appointments directly from the list</li>
            </ul>
          </div>
        </section>

        {/* Requests Tab */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Requests Tab</h2>
          <div className="space-y-3 text-sm text-[var(--muted)]">
            <p>Manage all appointment requests:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Search:</strong> Find requests by customer name, email, phone, or description</li>
              <li><strong>Filters:</strong> Filter by status (requested, contacting, scheduled, etc.) or artist</li>
              <li><strong>Actions:</strong> Click any request to view details, schedule, or update status</li>
              <li><strong>Bulk Actions:</strong> Select multiple requests to update their status at once</li>
            </ul>
          </div>
        </section>

        {/* Calendar Tab */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Calendar Tab</h2>
          <div className="space-y-3 text-sm text-[var(--muted)]">
            <p>View and manage appointments on a calendar:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>View All Appointments:</strong> See all scheduled appointments across all artists</li>
              <li><strong>Color Coding:</strong> Each artist has their own color for easy identification</li>
              <li><strong>Click Dates:</strong> Click any date to create a new appointment</li>
              <li><strong>Click Appointments:</strong> Click any appointment to view or edit details</li>
            </ul>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Quick Actions</h2>
          <div className="space-y-3 text-sm text-[var(--muted)]">
            <p>Quick shortcuts to common tasks:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Quick Search:</strong> Search for customers by name, email, or phone</li>
              <li><strong>New Requests:</strong> View pending appointment requests</li>
              <li><strong>Appointments:</strong> View all scheduled appointments</li>
              <li><strong>Customers:</strong> Manage customer database</li>
              <li><strong>Revenue:</strong> View earnings and financial reports</li>
              <li><strong>Waitlist:</strong> Manage customers waiting for appointments</li>
            </ul>
          </div>
        </section>

        {/* Scheduling */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Scheduling Appointments</h2>
          <div className="space-y-3 text-sm text-[var(--muted)]">
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Click "Schedule" on any request or click "+ New Appointment"</li>
              <li>Select the artist, date, and time</li>
              <li>Add any notes or special instructions</li>
              <li>Click "Create Appointment"</li>
              <li>The system will automatically check for scheduling conflicts</li>
            </ol>
          </div>
        </section>

        {/* Customer Management */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Customer Management</h2>
          <div className="space-y-3 text-sm text-[var(--muted)]">
            <p>Manage customer information:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>View History:</strong> See all requests and appointments for each customer</li>
              <li><strong>Add Notes:</strong> Keep track of customer preferences, allergies, or special requests</li>
              <li><strong>Contact:</strong> Call or text customers directly from their profile</li>
            </ul>
          </div>
        </section>

        {/* Tips */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Pro Tips</h2>
          <div className="space-y-3 text-sm text-[var(--muted)]">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the search bar to quickly find customers or requests</li>
              <li>Filter by artist to see only relevant appointments</li>
              <li>Export appointments to CSV for external reporting</li>
              <li>Set up automated reminders for upcoming appointments</li>
              <li>Use bulk actions to update multiple requests at once</li>
            </ul>
          </div>
        </section>

        {/* Support */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Need Help?</h2>
          <p className="text-sm text-[var(--muted)]">
            If you have questions or encounter issues, contact the system administrator or refer to the documentation.
          </p>
        </section>
      </div>

      <div className="mt-8 flex justify-end">
        <Link
          href="/admin/dashboard"
          className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
