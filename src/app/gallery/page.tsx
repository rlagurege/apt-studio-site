"use client";

import Link from "next/link";
import { tattoos } from "@/content/tattoos";
import { artists } from "@/content/artists";
import AppleStyleGallery from "@/components/AppleStyleGallery";

export default function GalleryPage() {
  const artistBySlug = Object.fromEntries(artists.map((a) => [a.slug, a]));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <section className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">Gallery</h1>
        <p className="mt-2 text-[var(--muted)] max-w-2xl mx-auto">
          A selection of work from the shop. Tap any image to view full size.
        </p>
      </section>

      <section>
        {tattoos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] py-16 text-center text-[var(--muted)]">
            <p>No gallery pieces yet.</p>
            <p className="mt-1 text-sm">
              Add tattoos in <code>src/content/tattoos.ts</code> and put images in{" "}
              <code>public/tattoos/</code>.
            </p>
          </div>
        ) : (
          <AppleStyleGallery tattoos={tattoos} artistBySlug={artistBySlug} />
        )}
      </section>

      <section className="mt-12 flex justify-center">
        <Link
          href="/appointments"
          className="rounded-xl bg-red-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-red-500 transition-colors"
        >
          Request appointment
        </Link>
      </section>
    </main>
  );
}
