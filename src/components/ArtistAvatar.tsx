"use client";

import Image from "next/image";
import { useState } from "react";

type ArtistAvatarProps = {
  src: string;
  alt: string;
  /** Shown in fallback when image fails (e.g. initials "CC", "MM") */
  fallbackLabel?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
};

/** Profile image with fallback to a profile icon (person silhouette) when image fails. */
export default function ArtistAvatar({
  src,
  alt,
  fallbackLabel,
  className = "object-cover",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  loading,
}: ArtistAvatarProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-2 bg-[var(--surface)] text-[var(--muted)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-1/3 max-w-[80px] shrink-0"
          aria-hidden
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        {fallbackLabel && (
          <span className="rounded-full bg-[var(--border)] px-3 py-1 text-sm font-medium text-[var(--foreground)]">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      loading={loading}
      onError={() => setError(true)}
    />
  );
}
