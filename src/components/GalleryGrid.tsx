import type { Tattoo } from "@/lib/types";
import BeforeAfterCard from "./BeforeAfterCard";

export default function GalleryGrid({ tattoos }: { tattoos: Tattoo[] }) {
  if (!tattoos.length) {
    return (
      <div className="mx-auto mt-4 max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-sm text-[var(--muted)]">
        Portfolio coming soon.
      </div>
    );
  }

  return (
    <div className="mx-auto mt-4 grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
      {tattoos.map((t) => (
        <div
          key={t.id}
          className="w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-md"
        >
          <BeforeAfterCard tattoo={t} />
        </div>
      ))}
    </div>
  );
}
