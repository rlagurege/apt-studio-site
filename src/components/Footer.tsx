import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <div className="flex flex-col gap-4 text-sm text-[var(--muted)] sm:flex-row sm:flex-wrap sm:justify-center sm:gap-8">
          <div>
            <p className="font-semibold text-[var(--foreground)]">{SITE.name}</p>
            <p className="mt-1">{SITE.addressSingleLine}</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)]">Hours</p>
            <p className="mt-1">Sun: Appointment Only · Mon–Sat: 12–8</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)]">Contact</p>
            <a
              href={`tel:${SITE.phone.replace(/\D/g, "")}`}
              className="mt-1 block underline hover:text-red-500"
            >
              {SITE.phone}
            </a>
            <Link href="/appointments" className="mt-1 block underline hover:text-red-500">
              Request appointment — Tami will follow up
            </Link>
          </div>
        </div>
        <p className="mt-8 text-[var(--muted)]">
          © {new Date().getFullYear()} {SITE.name}
        </p>
      </div>
    </footer>
  );
}
