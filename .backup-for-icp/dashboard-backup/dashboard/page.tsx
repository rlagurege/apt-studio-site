import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminDashboardClient from "./AdminDashboardClient";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;
  const userSlug = (session?.user as { artistSlug?: string } | undefined)?.artistSlug;

  if (!isAdmin || !userSlug) {
    redirect("/artist/login?callbackUrl=/admin/dashboard");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Scheduling & Appointment Management</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/gallery"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]"
          >
            Manage Gallery
          </Link>
          <Link
            href="/admin/revenue"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]"
          >
            Revenue
          </Link>
          <Link
            href="/admin/help"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]"
          >
            Help
          </Link>
          <Link
            href="/api/auth/signout"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]"
          >
            Sign out
          </Link>
        </div>
      </div>

      <AdminDashboardClient />
    </main>
  );
}
