import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">Page not found</h1>
      <p className="mt-3 text-[var(--muted)]">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-500"
      >
        Back to home
      </Link>
    </main>
  );
}
