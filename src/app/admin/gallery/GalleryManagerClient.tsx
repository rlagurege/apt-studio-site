"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { tattoos } from "@/content/tattoos";
import type { Tattoo } from "@/lib/types";

export default function GalleryManagerClient() {
  const [galleryItems, setGalleryItems] = useState<Tattoo[]>(tattoos);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filteredItems =
    filter === "all" ? galleryItems : galleryItems.filter((t) => t.artistSlug === filter);

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this image from the gallery?")) {
      return;
    }

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setGalleryItems((prev) => prev.filter((t) => t.id !== id));
      } else {
        const data = await res.json();
        alert(`Failed to delete: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      alert("Failed to delete image");
    } finally {
      setDeleting(null);
    }
  };

  const uniqueArtists = Array.from(new Set(galleryItems.map((t) => t.artistSlug)));

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <label htmlFor="filter" className="text-sm font-medium text-[var(--foreground)]">
          Filter by artist:
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="all">All Artists ({galleryItems.length})</option>
          {uniqueArtists.map((slug) => {
            const count = galleryItems.filter((t) => t.artistSlug === slug).length;
            return (
              <option key={slug} value={slug}>
                {slug.replace(/-/g, " ")} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
          No images in gallery.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden cursor-pointer hover:border-[var(--accent)] transition-colors"
              onClick={() => handleDelete(item.id, item.imageUrl)}
            >
              <Image
                src={item.imageUrl}
                alt={item.title || "Gallery image"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center p-2">
                  <p className="text-white text-xs font-medium mb-1">{item.title || "Untitled"}</p>
                  <p className="text-white/80 text-xs capitalize">
                    {item.artistSlug.replace(/-/g, " ")}
                  </p>
                  {deleting === item.id ? (
                    <p className="text-red-300 text-xs mt-2">Deleting...</p>
                  ) : (
                    <p className="text-red-300 text-xs mt-2">Click to delete</p>
                  )}
                </div>
              </div>
              {/* ID Badge */}
              <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                {item.id}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <p className="text-sm text-[var(--muted)]">
          Showing <strong className="text-[var(--foreground)]">{filteredItems.length}</strong> of{" "}
          <strong className="text-[var(--foreground)]">{galleryItems.length}</strong> total images
        </p>
      </div>
    </div>
  );
}
