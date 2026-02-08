"use client";

import Link from "next/link";
import type { Artist } from "@/lib/types";
import { prettyStyleTag } from "@/lib/utils";
import ArtistAvatar from "./ArtistAvatar";

export default function FaceGrid({ artists }: { artists: Artist[] }) {
  return (
    <div className="grid w-full max-w-3xl mx-auto gap-5 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
      {artists.map((a, i) => (
        <div
          key={a.slug}
          className="group relative w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-md"
        >
          <div className="relative aspect-[4/5]">
            <ArtistAvatar
              src={a.avatarUrl}
              alt={a.name}
              fallbackLabel={a.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              priority={i === 0}
              loading={i === 0 ? undefined : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute -inset-20 bg-[radial-gradient(circle_at_50%_110%,rgba(220,38,38,.2),transparent_60%)]" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold tracking-tight text-white">{a.name}</div>
                  <div className="text-xs text-neutral-200">{a.role}</div>
                </div>
                <div className="flex gap-2">
                  {a.facebookUrl && (
                    <a
                      href={a.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/30 bg-black/30 px-3 py-1 text-xs text-white hover:bg-black/50"
                    >
                      Facebook
                    </a>
                  )}
                  {a.instagramUrl && (
                    <a
                      href={a.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/30 bg-black/30 px-3 py-1 text-xs text-white hover:bg-black/50"
                    >
                      IG
                    </a>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {a.specialties.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/30 bg-black/40 px-3 py-1 text-[11px] text-white"
                  >
                    {prettyStyleTag(s)}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/artists/${a.slug}`}
                  className="flex-1 rounded-xl border border-white/40 bg-black/30 px-4 py-2 text-center text-sm text-white hover:bg-black/50"
                >
                  View Profile
                </Link>
                <Link
                  href={`/appointments?artist=${encodeURIComponent(a.slug)}`}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-red-500"
                >
                  Request Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
