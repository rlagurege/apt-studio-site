"use client";

import { useState } from "react";
import BeforeAfterCard from "@/components/BeforeAfterCard";
import GalleryModal from "@/components/GalleryModal";
import type { Tattoo } from "@/lib/types";

export default function ArtistPortfolioGrid({
  work,
  artistName,
}: {
  work: Tattoo[];
  artistName: string;
}) {
  const [previewTattoo, setPreviewTattoo] = useState<Tattoo | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
        {work.map((t) => (
          <div key={t.id} onClick={() => setPreviewTattoo(t)} className="cursor-pointer">
            <BeforeAfterCard tattoo={t} onPreview={setPreviewTattoo} />
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTattoo && (
        <GalleryModal
          tattoo={previewTattoo}
          artistName={artistName}
          isOpen={!!previewTattoo}
          onClose={() => setPreviewTattoo(null)}
        />
      )}
    </>
  );
}
