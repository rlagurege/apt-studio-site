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
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-[var(--border)] bg-[var(--surface)]">
            <Image
              src={artist.avatarUrl}
              alt={artist.name}
              fill
              className="object-cover"
              sizes="144px"
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

          {/* Style tags */}
          <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
            {artist.specialties.map((s) => (
              <span
                key={s}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--foreground)]"
              >
                {prettyStyleTag(s)}
              </span>
            ))}
          </div>

          {/* CTA + social */}
          <div className="mt-5 flex flex-wrap justify-center sm:justify-start gap-3">
            <Link
              href={`/appointments?artist=${encodeURIComponent(artist.slug)}`}
              className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Book with {artist.name}
            </Link>
            {artist.instagramUrl && (
              <a
                href={artist.instagramUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
              >
                Instagram
              </a>
            )}
            {artist.facebookUrl && (
              <a
                href={artist.facebookUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
              >
                Facebook
              </a>
            )}
          </div>
        </div>
      </header>

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
