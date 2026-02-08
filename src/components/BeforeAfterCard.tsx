"use client";

import { useState } from "react";
import Image from "next/image";
import type { Tattoo } from "@/lib/types";

type Props = {
  tattoo: Tattoo;
  onPreview?: (tattoo: Tattoo) => void;
};

export default function BeforeAfterCard({ tattoo, onPreview }: Props) {
  const [showBefore, setShowBefore] = useState(false);
  
  const handleClick = () => {
    if (onPreview) {
      onPreview(tattoo);
    } else {
      setShowBefore(!showBefore);
    }
  };

  if (!tattoo.beforeImageUrl) {
    // No before photo, just show the after
    return (
      <div
        className="relative aspect-square bg-[var(--surface)] overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        onClick={onPreview ? () => onPreview(tattoo) : undefined}
      >
        <Image
          src={tattoo.imageUrl}
          alt={tattoo.title ?? "Tattoo"}
          fill
          sizes="(max-width: 640px) 33vw, 280px"
          className="object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-square bg-[var(--surface)] overflow-hidden rounded-lg cursor-pointer group"
      onMouseEnter={() => !onPreview && setShowBefore(true)}
      onMouseLeave={() => !onPreview && setShowBefore(false)}
      onClick={handleClick}
    >
      {/* After photo */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${showBefore ? "opacity-0" : "opacity-100"}`}>
        <Image
          src={tattoo.imageUrl}
          alt={tattoo.title ?? "After"}
          fill
          sizes="(max-width: 640px) 33vw, 280px"
          className="object-cover"
          loading="lazy"
        />
      </div>

      {/* Before photo */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${showBefore ? "opacity-100" : "opacity-0"}`}>
        <Image
          src={tattoo.beforeImageUrl}
          alt={tattoo.title ? `${tattoo.title} - Before` : "Before"}
          fill
          sizes="(max-width: 640px) 33vw, 280px"
          className="object-cover"
          loading="lazy"
        />
      </div>

      {/* Label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-xs font-medium text-white">
          {showBefore ? "Before" : "After"}
        </p>
        {tattoo.title && (
          <p className="text-xs text-white/80 mt-0.5">{tattoo.title}</p>
        )}
      </div>

      {/* Hover indicator */}
      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        {showBefore ? "Click for After" : "Click for Before"}
      </div>
    </div>
  );
}
