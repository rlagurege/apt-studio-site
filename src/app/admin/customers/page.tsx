"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  _count?: {
    requests: number;
    appointments: number;
  };
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.includes(query)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Customers</h1>
        <p className="text-[var(--muted)]">Manage customer records and view history</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
        />
      </div>

      {/* Customers List */}
      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
          {searchQuery ? "No customers found matching your search." : "No customers yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((customer) => (
            <div
              key={customer.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 hover:border-[var(--accent)]/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/admin/customers/${customer.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                    {customer.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[var(--muted)]">
                    {customer.email && (
                      <div>
                        <span className="font-medium">Email:</span> {customer.email}
                      </div>
                    )}
                    {customer.phone && (
                      <div>
                        <span className="font-medium">Phone:</span> {customer.phone}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Requests:</span>{" "}
                      {customer._count?.requests || 0}
                    </div>
                    <div>
                      <span className="font-medium">Appointments:</span>{" "}
                      {customer._count?.appointments || 0}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/customers/${customer.id}`);
                  }}
                  className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
