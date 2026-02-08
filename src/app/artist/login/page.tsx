"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { artists } from "@/content/artists";
import { staff } from "@/lib/staff";
import { PasskeyLogin, PasskeyRegister } from "@/components/PasskeyAuth";
import Link from "next/link";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/artist/dashboard";
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        slug,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError("Invalid artist or password.");
        setLoading(false);
        return;
      }
      if (res?.url) window.location.href = res.url;
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-[var(--foreground)] text-center">Staff sign in</h1>
        <p className="mt-2 text-sm text-[var(--muted)] text-center">
          Sign in to view your appointments and notifications.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Staff Member
            </label>
            <select
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              required
            >
              <option value="">Choose staff member</option>
              <optgroup label="Admin">
                {staff.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Artists">
                {artists.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in with Password"}
          </button>
        </form>

        {slug && (
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted)] text-center mb-3">
              Or use biometric authentication (Face ID / Fingerprint)
            </p>
            <div className="space-y-3">
              <PasskeyLogin
                slug={slug}
                userName={staff.find((s) => s.slug === slug)?.name || artists.find((a) => a.slug === slug)?.name || slug}
                onSuccess={() => {
                  // After passkey login, redirect to dashboard
                  const finalUrl = slug === "tammy-gomula" ? "/admin/dashboard" : callbackUrl;
                  window.location.href = finalUrl;
                }}
              />
              <PasskeyRegister
                slug={slug}
                userName={staff.find((s) => s.slug === slug)?.name || artists.find((a) => a.slug === slug)?.name || slug}
              />
            </div>
          </div>
        )}

        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
            ← Back to site
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function ArtistLoginPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto max-w-sm px-4 py-16">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg">
          <p className="text-center text-[var(--muted)]">Loading...</p>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
