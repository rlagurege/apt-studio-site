"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { formatStyleTag } from "@/lib/utils";
import type { Tattoo } from "@/lib/types";

type GridSize = "small" | "medium" | "large";

type Props = {
  tattoos: Tattoo[];
  artistBySlug: Record<string, { name: string; role: string } | undefined>;
};

export default function AppleStyleGallery({ tattoos, artistBySlug }: Props) {
  const [gridSize, setGridSize] = useState<GridSize>("medium");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Grid column classes based on size
  const gridClasses = {
    small: "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6",
    medium: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    large: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  // Gap classes based on size
  const gapClasses = {
    small: "gap-1 sm:gap-1.5",
    medium: "gap-2 sm:gap-3",
    large: "gap-4 sm:gap-6",
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (focusedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && focusedIndex > 0) {
        setFocusedIndex(focusedIndex - 1);
      } else if (e.key === "ArrowRight" && focusedIndex < tattoos.length - 1) {
        setFocusedIndex(focusedIndex + 1);
      } else if (e.key === "Escape") {
        setFocusedIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, tattoos.length]);

  // Handle touch swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || focusedIndex === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && focusedIndex < tattoos.length - 1) {
      setFocusedIndex(focusedIndex + 1);
    }
    if (isRightSwipe && focusedIndex > 0) {
      setFocusedIndex(focusedIndex - 1);
    }
  };

  // Scroll focused image into view when changed
  useEffect(() => {
    if (focusedIndex !== null && imageRefs.current[focusedIndex]) {
      imageRefs.current[focusedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [focusedIndex]);

  // Lock body scroll when focused
  useEffect(() => {
    if (focusedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [focusedIndex]);

  const focusedTattoo = focusedIndex !== null ? tattoos[focusedIndex] : null;

  return (
    <>
      {/* Grid Size Controls */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="text-sm text-[var(--muted)] mr-2">Grid:</span>
        <button
          onClick={() => setGridSize("small")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            gridSize === "small"
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]"
          }`}
        >
          Small
        </button>
        <button
          onClick={() => setGridSize("medium")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            gridSize === "medium"
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]"
          }`}
        >
          Medium
        </button>
        <button
          onClick={() => setGridSize("large")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            gridSize === "large"
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]"
          }`}
        >
          Large
        </button>
      </div>

      {/* Grid View */}
      <div
        className={`grid ${gridClasses[gridSize]} ${gapClasses[gridSize]} transition-all duration-300`}
      >
        {tattoos.map((tattoo, index) => {
          const artist = artistBySlug[tattoo.artistSlug];
          const isFocused = focusedIndex === index;

          return (
            <div
              key={tattoo.id}
              ref={(el) => { imageRefs.current[index] = el; }}
              className={`relative group cursor-pointer overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 ${
                isFocused
                  ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)] z-10"
                  : "hover:border-[var(--accent)]/50 hover:shadow-lg"
              }`}
              onClick={() => setFocusedIndex(index)}
            >
              <div className="aspect-square relative bg-[var(--surface)]">
                <Image
                  src={tattoo.imageUrl}
                  alt={tattoo.title ?? "Tattoo"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes={
                    gridSize === "small"
                      ? "(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
                      : gridSize === "medium"
                      ? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  }
                />
              </div>
              {gridSize !== "small" && (
                <div className="p-2 sm:p-3">
                  <p className="font-medium text-[var(--foreground)] text-sm truncate">
                    {tattoo.title ?? "Untitled"}
                  </p>
                  {gridSize === "large" && (
                    <>
                      <p className="text-xs text-[var(--muted)] mt-0.5">
                        {artist?.name ?? tattoo.artistSlug}
                      </p>
                      <p className="text-xs text-[var(--muted)] mt-1">
                        {tattoo.styles.map(formatStyleTag).join(", ")}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Focused View (Fullscreen) */}
      {focusedIndex !== null && focusedTattoo && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setFocusedIndex(null)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFocusedIndex(null);
            }}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors p-2"
            aria-label="Close"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Navigation Arrows */}
          {focusedIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFocusedIndex(focusedIndex - 1);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 bg-black/50 rounded-full backdrop-blur-sm"
              aria-label="Previous"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {focusedIndex < tattoos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFocusedIndex(focusedIndex + 1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 bg-black/50 rounded-full backdrop-blur-sm"
              aria-label="Next"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Image Container */}
          <div
            className="relative max-w-[95vw] max-h-[95vh] w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={focusedTattoo.imageUrl}
              alt={focusedTattoo.title ?? "Tattoo"}
              width={1200}
              height={1200}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              priority
            />
          </div>

          {/* Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-semibold text-white mb-2">
                {focusedTattoo.title ?? "Untitled"}
              </h3>
              {artistBySlug[focusedTattoo.artistSlug] && (
                <p className="text-white/80 text-sm mb-3">
                  By {artistBySlug[focusedTattoo.artistSlug]!.name}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {focusedTattoo.styles.map((style) => (
                  <span
                    key={style}
                    className="rounded-full bg-white/20 px-3 py-1 text-xs text-white"
                  >
                    {formatStyleTag(style)}
                  </span>
                ))}
              </div>
              <p className="text-white/60 text-xs mt-4">
                {focusedIndex + 1} of {tattoos.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
