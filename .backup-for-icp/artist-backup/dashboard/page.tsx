import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ArtistDashboardClient from "./ArtistDashboardClient";
import { PasskeyRegister } from "@/components/PasskeyAuth";
import { artists } from "@/content/artists";
import { staff } from "@/lib/staff";
import Link from "next/link";

export default async function ArtistDashboardPage() {
  const session = await getServerSession(authOptions);
  const artistSlug = (session?.user as { artistSlug?: string } | undefined)?.artistSlug;

  if (!artistSlug) {
    redirect("/artist/login?callbackUrl=/artist/dashboard");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Artist dashboard</h1>
        <div className="flex items-center gap-3">
          <Link
            href={`/artists/${artistSlug}`}
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            View my profile
          </Link>
          <Link
            href="/api/auth/signout"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]"
          >
            Sign out
          </Link>
        </div>
      </div>

      {/* Passkey Registration */}
      <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-2">Biometric Login</h2>
        <p className="text-xs text-[var(--muted)] mb-3">
          Register a passkey to sign in with Face ID, Touch ID, or Windows Hello.
        </p>
        <PasskeyRegister
          slug={artistSlug}
          userName={staff.find((s) => s.slug === artistSlug)?.name || artists.find((a) => a.slug === artistSlug)?.name || artistSlug}
        />
      </div>

      <ArtistDashboardClient artistSlug={artistSlug} />
    </main>
  );
}
