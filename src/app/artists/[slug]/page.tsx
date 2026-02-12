import { artists } from "@/content/artists";
import { tattoos } from "@/content/tattoos";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prettyStyleTag } from "@/lib/utils";
import ArtistPortfolioGrid from "./ArtistPortfolioGrid";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return artists.map((a) => ({ slug: a.slug }));
}

export default async function ArtistProfile({ params }: Props) {
  const { slug } = await params;
  const artist = artists.find((a) => a.slug === slug);
  if (!artist) return notFound();

  const work = tattoos.filter((t) => t.artistSlug === artist.slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* Instagram-style header */}
      <header className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-10 pb-8 border-b border-[var(--border)]">
        <div className="shrink-0 flex justify-center sm:justify-start">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-[var(--border)] bg-[var(--surface)] shadow-lg">
            <Image
              src={artist.avatarUrl}
              alt={artist.name}
              fill
              className="object-cover"
              sizes="160px"
              priority
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">{artist.name}</h1>
          <p className="mt-0.5 text-sm text-[var(--muted)]">{artist.role}</p>

          {/* Stats row (Instagram-like) */}
          <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-6 text-[var(--foreground)]">
            <span className="text-sm">
              <strong className="font-semibold">{work.length}</strong>
              <span className="text-[var(--muted)] ml-1">pieces</span>
            </span>
            <span className="text-sm">
              <strong className="font-semibold">{artist.specialties.length}</strong>
              <span className="text-[var(--muted)] ml-1">styles</span>
            </span>
          </div>

          <p className="mt-4 text-sm text-[var(--foreground)] leading-relaxed">{artist.bio}</p>

          {/* CTA + social icons */}
          <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <Link
              href={`/appointments?artist=${encodeURIComponent(artist.slug)}`}
              className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Book with {artist.name}
            </Link>
            
            {/* Instagram Icon */}
            {artist.instagramUrl && artist.instagramUrl !== "https://www.instagram.com/" ? (
              <a
                href={artist.instagramUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors"
                aria-label="Instagram"
                title="Instagram"
              >
                <svg className="w-5 h-5 text-[var(--foreground)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            ) : (
              <a
                href="https://www.facebook.com/addictivepain/"
                target="_blank"
                rel="noreferrer noopener"
                className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors"
                aria-label="Instagram (Addictive Pain Facebook)"
                title="Instagram"
              >
                <svg className="w-5 h-5 text-[var(--foreground)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
            
            {/* Facebook Icon */}
            <a
              href={artist.facebookUrl || "https://www.facebook.com/addictivepain/"}
              target="_blank"
              rel="noreferrer noopener"
              className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors"
              aria-label="Facebook"
              title="Facebook"
            >
              <svg className="w-5 h-5 text-[var(--foreground)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Style tags - Separate section so they don't cover profile picture */}
      <section className="mt-6 pb-6 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">Styles</h2>
        <div className="flex flex-wrap gap-2">
          {artist.specialties.map((s) => (
            <span
              key={s}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--card)] transition-colors"
            >
              {prettyStyleTag(s)}
            </span>
          ))}
        </div>
      </section>

      {/* Portfolio grid (Instagram-style: 3 cols, square, no gaps) */}
      <section className="mt-8">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Portfolio</span>
          {work.length > 0 && (
            <span className="text-xs text-[var(--muted)]">({work.length})</span>
          )}
        </div>

        {work.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-sm text-[var(--muted)]">
            Portfolio coming soon.
          </div>
        ) : (
          <ArtistPortfolioGrid work={work} artistName={artist.name} />
        )}
      </section>
    </main>
  );
}
