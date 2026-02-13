"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import FaceGrid from "@/components/FaceGrid";
import TattooWalls from "@/components/TattooWalls";
import { artists } from "@/content/artists";
import { SITE } from "@/lib/site";

type StyleKey = "modern" | "traditional" | "japanese" | "horror";

export default function HomePage() {
  const [styleKey, setStyleKey] = useState<StyleKey>("modern");

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-style]"));

    const io = new IntersectionObserver(
      (entries) => {
        // pick the most visible section
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (!best) return;

        const next = best.target.getAttribute("data-style") as StyleKey | null;
        if (next) setStyleKey(next);
      },
      { root: null, threshold: [0.25, 0.4, 0.55, 0.7] }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative">
      <TattooWalls styleKey={styleKey} />

      <main className="relative z-10 mx-auto max-w-6xl px-4 lg:px-[200px]">
        {/* Hero = modern */}
        <section
          data-style="modern"
          className="relative min-h-[640px] sm:min-h-[720px] flex flex-col items-center justify-center overflow-hidden border-b border-[var(--border)] bg-black py-16 sm:py-20 text-center"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/hero-cover.png"
              alt=""
              fill
              className="object-contain object-center"
              sizes="100vw"
              priority
            />
          </div>
          <h1 className="sr-only">{SITE.name}</h1>
        </section>

        {/* CTAs = traditional (punchy) */}
        <section data-style="traditional" className="border-b border-[var(--border)] bg-[var(--card)] py-10 sm:py-14">
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
            <Link
              href="/appointments"
              className="w-full max-w-xs rounded-2xl bg-red-600 px-8 py-4 text-center text-lg font-semibold tracking-tight text-white shadow-lg transition hover:bg-red-500 sm:max-w-sm sm:py-5 sm:text-xl"
            >
              Book a Session
            </Link>
            <Link
              href="/artists"
              className="w-full max-w-xs rounded-2xl border-2 border-[var(--foreground)] bg-transparent px-8 py-4 text-center text-lg font-semibold tracking-tight text-[var(--foreground)] transition hover:bg-[var(--foreground)] hover:text-[var(--background)] sm:max-w-sm sm:py-5 sm:text-xl"
            >
              Meet the Crew
            </Link>
          </div>
          <p className="mt-6 text-center text-sm text-[var(--muted)] sm:text-base">
            {SITE.tagline} · Welcome to the Shop
          </p>
        </section>

        {/* Meet the Crew = japanese (ink-heavy) */}
        <section data-style="japanese" className="py-14 sm:py-20 text-center bg-[var(--card)] border-t border-[var(--border)]">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
            Meet the Crew
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] max-w-xl mx-auto">
            Pick an artist by style. View their work. Request an appointment—Tami will follow up to schedule.
          </p>
          <div className="mt-8 flex justify-center">
            <FaceGrid artists={artists} />
          </div>
        </section>

        {/* Hours = modern */}
        <section data-style="modern" className="border-y border-[var(--border)] bg-[var(--surface)] py-12 text-center">
          <h2 className="text-2xl font-semibold text-[var(--foreground)]">Hours</h2>
          <ul className="mt-4 inline-block space-y-2 text-sm text-[var(--muted)] text-left">
            {SITE.hours.map((row) => (
              <li key={row.days} className="flex justify-between gap-8">
                <span>{row.days}</span>
                <span>{row.hours}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Location = horror (cinematic) */}
        <section data-style="horror" className="border-b border-[var(--border)] bg-[var(--card)] py-12 text-center">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">Location</h2>
          <div className="mt-6 flex flex-col items-center gap-6 sm:gap-8">
            <div className="space-y-2 text-sm text-[var(--muted)] sm:text-base">
              <p className="font-medium text-[var(--foreground)] text-base sm:text-lg">{SITE.addressSingleLine}</p>
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
                <a href={`tel:${SITE.phone.replace(/\D/g, "")}`} className="underline hover:text-red-500 transition-colors">
                  {SITE.phone}
                </a>
                <span className="hidden sm:inline text-[var(--muted)]">·</span>
                <a href={SITE.mapsUrl} target="_blank" rel="noreferrer noopener" className="underline hover:text-red-500 transition-colors">
                  Open in Google Maps →
                </a>
              </div>
            </div>

            <div className="w-full max-w-2xl aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg transition-all duration-300 hover:shadow-xl hover:border-[var(--accent)]/30">
              <div className="relative w-full h-full">
                <iframe
                  title="Addictive Pain Tattoo location"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(SITE.addressSingleLine)}&output=embed&z=15&hl=en`}
                  width="100%"
                  height="100%"
                  className="border-0 absolute inset-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ border: "none", minHeight: "300px" }}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
