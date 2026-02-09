"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";

const tabs = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/artists", label: "Artists" },
  { href: "/gallery", label: "Gallery" },
  { href: "/appointments", label: "Request appointment" },
];

export default function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const artistSlug = (session?.user as { artistSlug?: string } | undefined)?.artistSlug;
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md">
      <div className="mx-auto max-w-4xl px-4 pt-5 pb-4">
        <div className="relative flex items-center justify-center">
          <Link
            href="/"
            className="block text-center no-underline"
            aria-label={`${SITE.name} — Home`}
          >
            <Image
              src="/nav-logos.png"
              alt={SITE.name}
              width={200}
              height={60}
              className="mx-auto h-auto w-auto max-w-[200px]"
              priority
            />
            <span className="sr-only">{SITE.name}</span>
          </Link>
          {status !== "loading" && !artistSlug && (
            <Link
              href="/artist/login"
              className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-50 transition-opacity"
              aria-label="Staff sign in"
              title="Staff sign in"
            >
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--muted)]">
                <circle cx="16" cy="16" r="14" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.2"/>
                <text x="16" y="19.5" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="bold" textAnchor="middle" fill="currentColor">APT</text>
              </svg>
            </Link>
          )}
        </div>
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 sm:gap-x-7">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "text-sm font-medium transition-colors sm:text-[15px]",
                  isActive
                    ? "text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
          {status !== "loading" && (
            artistSlug ? (
              <>
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    className={cn(
                      "text-sm font-medium transition-colors sm:text-[15px]",
                      pathname.startsWith("/admin/dashboard")
                        ? "text-[var(--accent)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    )}
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/artist/dashboard"
                    className={cn(
                      "text-sm font-medium transition-colors sm:text-[15px]",
                      pathname.startsWith("/artist/dashboard")
                        ? "text-[var(--accent)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    )}
                  >
                    Dashboard
                  </Link>
                )}
              </>
            ) : null
          )}
        </nav>
      </div>
    </header>
  );
}
