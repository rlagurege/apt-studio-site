"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  email: string;
  status: string;
  roles: Array<{ role: { name: string } }>;
};

type Location = {
  id: string;
  name: string;
  address: string;
  timezone: string;
};

type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number | null;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"users" | "locations" | "services">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, locationsRes, servicesRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/locations"),
        fetch("/api/services"),
      ]);

      const usersData = await usersRes.json();
      const locationsData = await locationsRes.json();
      const servicesData = await servicesRes.json();

      setUsers(usersData.users || []);
      setLocations(locationsData.locations || []);
      setServices(servicesData.services || []);
    } catch (error) {
      console.error("Failed to load settings data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Settings</h1>
        <p className="text-[var(--muted)]">Manage users, locations, and services</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "users"
              ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("locations")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "locations"
              ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Locations
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "services"
              ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Services
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Users</h2>
            <button className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity">
              Add User
            </button>
          </div>
          {loading ? (
            <div className="text-center py-12 text-[var(--muted)]">Loading...</div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">{user.name}</h3>
                      <p className="text-sm text-[var(--muted)]">{user.email}</p>
                      <div className="mt-2 flex gap-2">
                        {user.roles.map((ur, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded text-xs bg-[var(--surface)] text-[var(--foreground)]"
                          >
                            {ur.role.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors text-sm">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === "locations" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Locations</h2>
            <button className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity">
              Add Location
            </button>
          </div>
          {loading ? (
            <div className="text-center py-12 text-[var(--muted)]">Loading...</div>
          ) : (
            <div className="space-y-4">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        {location.name}
                      </h3>
                      <p className="text-sm text-[var(--muted)]">{location.address}</p>
                      <p className="text-xs text-[var(--muted)] mt-1">Timezone: {location.timezone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors text-sm">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Services Tab */}
      {activeTab === "services" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Services</h2>
            <button className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity">
              Add Service
            </button>
          </div>
          {loading ? (
            <div className="text-center py-12 text-[var(--muted)]">Loading...</div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-[var(--muted)] mt-1">{service.description}</p>
                      )}
                      <div className="mt-2 flex gap-4 text-sm text-[var(--muted)]">
                        <span>Duration: {service.durationMinutes} min</span>
                        {service.priceCents && (
                          <span>Price: ${(service.priceCents / 100).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors text-sm">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
