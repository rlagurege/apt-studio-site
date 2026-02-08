"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      loadCustomerData();
    }
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      const data = await res.json();
      setCustomer(data.customer);
      setRequests(data.requests || []);
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Failed to load customer data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12 text-[var(--muted)]">Loading...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12 text-[var(--muted)]">Customer not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-[var(--accent)] hover:underline mb-4"
        >
          ← Back to Customers
        </button>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">{customer.name}</h1>
      </div>

      {/* Customer Info */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customer.email && (
            <div>
              <dt className="text-sm text-[var(--muted)] mb-1">Email</dt>
              <dd className="text-[var(--foreground)]">
                <a href={`mailto:${customer.email}`} className="hover:underline">
                  {customer.email}
                </a>
              </dd>
            </div>
          )}
          {customer.phone && (
            <div>
              <dt className="text-sm text-[var(--muted)] mb-1">Phone</dt>
              <dd className="text-[var(--foreground)]">
                <a href={`tel:${customer.phone}`} className="hover:underline">
                  {customer.phone}
                </a>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm text-[var(--muted)] mb-1">Member Since</dt>
            <dd className="text-[var(--foreground)]">
              {format(new Date(customer.createdAt), "MMM d, yyyy")}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--muted)] mb-1">Total Requests</dt>
            <dd className="text-[var(--foreground)]">{requests.length}</dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--muted)] mb-1">Total Appointments</dt>
            <dd className="text-[var(--foreground)]">{appointments.length}</dd>
          </div>
        </div>
      </div>

      {/* Requests History */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Request History ({requests.length})
        </h2>
        {requests.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
            No requests yet
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 hover:border-[var(--accent)]/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/admin/dashboard?requestId=${request.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        {request.description?.substring(0, 50) || "No description"}...
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          request.status === "scheduled"
                            ? "bg-green-500/20 text-green-500"
                            : request.status === "declined"
                            ? "bg-red-500/20 text-red-500"
                            : "bg-yellow-500/20 text-yellow-500"
                        }`}
                      >
                        {request.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--muted)]">
                      <span>Created: {format(new Date(request.createdAt), "MMM d, yyyy")}</span>
                      {request.preferredArtist && (
                        <span className="ml-4">Artist: {request.preferredArtist.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointments History */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Appointment History ({appointments.length})
        </h2>
        {appointments.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
            No appointments yet
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 hover:border-[var(--accent)]/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/admin/appointments/${apt.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">{apt.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          apt.status === "confirmed"
                            ? "bg-green-500/20 text-green-500"
                            : apt.status === "canceled"
                            ? "bg-red-500/20 text-red-500"
                            : apt.status === "completed"
                            ? "bg-blue-500/20 text-blue-500"
                            : "bg-yellow-500/20 text-yellow-500"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--muted)]">
                      <span>
                        {format(new Date(apt.startAt), "MMM d, yyyy 'at' h:mm a")} -{" "}
                        {format(new Date(apt.endAt), "h:mm a")}
                      </span>
                      {apt.artist && <span className="ml-4">Artist: {apt.artist.name}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
