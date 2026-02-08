"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Tattoo } from "@/lib/types";
import { formatStyleTag } from "@/lib/utils";

type Props = {
  tattoo: Tattoo;
  artistName?: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function GalleryModal({ tattoo, artistName, isOpen, onClose }: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const [showBefore, setShowBefore] = useState(false);
  const hasBefore = !!tattoo.beforeImageUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-[90vw] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors z-10"
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

        {/* Image container */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          {hasBefore ? (
            <>
              {/* After image */}
              <div
                className={`transition-opacity duration-300 ${
                  showBefore ? "opacity-0 absolute inset-0" : "opacity-100"
                }`}
              >
                <Image
                  src={tattoo.imageUrl}
                  alt={tattoo.title ?? "After"}
                  width={1200}
                  height={1200}
                  className="w-full h-auto max-h-[85vh] object-contain"
                  priority
                />
              </div>

              {/* Before image */}
              <div
                className={`transition-opacity duration-300 ${
                  showBefore ? "opacity-100" : "opacity-0 absolute inset-0"
                }`}
              >
                <Image
                  src={tattoo.beforeImageUrl!}
                  alt={tattoo.title ? `${tattoo.title} - Before` : "Before"}
                  width={1200}
                  height={1200}
                  className="w-full h-auto max-h-[85vh] object-contain"
                  priority
                />
              </div>

              {/* Toggle button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBefore(!showBefore);
                }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg hover:bg-black/90 transition-colors"
              >
                {showBefore ? "Show After" : "Show Before"}
              </button>
            </>
          ) : (
            <Image
              src={tattoo.imageUrl}
              alt={tattoo.title ?? "Tattoo"}
              width={1200}
              height={1200}
              className="w-full h-auto max-h-[85vh] object-contain"
              priority
            />
          )}

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 sm:p-6">
            <h3 className="text-xl font-semibold text-white mb-1">
              {tattoo.title ?? "Untitled"}
            </h3>
            {artistName && (
              <p className="text-white/80 text-sm mb-2">By {artistName}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {tattoo.styles.map((style) => (
                <span
                  key={style}
                  className="rounded-full bg-white/20 px-3 py-1 text-xs text-white"
                >
                  {formatStyleTag(style)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
