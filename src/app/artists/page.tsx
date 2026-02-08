import { artists } from "@/content/artists";
import FaceGrid from "@/components/FaceGrid";

export default function ArtistsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">Artists</h1>
        <p className="mt-3 text-[var(--muted)] max-w-xl mx-auto">
          Choose an artist, explore their style, and request an appointment.
        </p>
      </header>
      <div className="flex justify-center">
        <FaceGrid artists={artists} />
      </div>
    </main>
  );
}
