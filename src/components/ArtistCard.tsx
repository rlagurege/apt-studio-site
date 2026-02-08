import Link from "next/link";
import type { Artist } from "@/lib/types";
import { formatStyleTag } from "@/lib/utils";
import ArtistAvatar from "./ArtistAvatar";

type ArtistCardProps = {
  artist: Artist;
};

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-800 bg-black">
      <div className="relative aspect-[4/5]">
        <ArtistAvatar
          src={artist.avatarUrl}
          alt={artist.name}
          fallbackLabel={artist.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-xl font-semibold tracking-tight">{artist.name}</h2>
          <p className="text-sm text-neutral-300">{artist.role}</p>
          {artist.bio && (
            <p className="mt-2 line-clamp-2 text-xs text-neutral-400">
              {artist.bio}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {artist.specialties.map((s) => (
              <span
                key={s}
                className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200"
              >
                {formatStyleTag(s)}
              </span>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            {artist.instagramUrl && (
              <a
                href={artist.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:border-neutral-500"
              >
                Instagram
              </a>
            )}
            {artist.facebookUrl && (
              <a
                href={artist.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:border-neutral-500"
              >
                Facebook
              </a>
            )}
            <Link
              href={`/appointments?artist=${encodeURIComponent(artist.slug)}`}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90"
            >
              Book
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
