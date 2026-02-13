import { artists } from "@/content/artists";
import BookingRequestForm from "@/components/BookingRequestForm";

type Props = {
  searchParams: Promise<{ artist?: string }>;
};

export default async function AppointmentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialArtistSlug = params?.artist;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">Request an appointment</h1>
        <p className="mt-3 mx-auto max-w-xl text-[var(--muted)]">
          Choose an artist, add a reference image, and describe your idea. Tami will reach out to confirm scheduling.
        </p>
      </header>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-center lg:gap-12">
        <div className="w-full max-w-xl mx-auto lg:mx-0 lg:max-w-xl flex-1 min-w-0">
          <BookingRequestForm artists={artists} initialArtistSlug={initialArtistSlug} />
        </div>

        <aside className="w-full max-w-xl mx-auto lg:mx-0 lg:w-[320px] lg:shrink-0">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-left">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">How it works</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-[var(--muted)]">
              <li>Pick the artist you want.</li>
              <li>Upload a reference image (optional but recommended).</li>
              <li>Describe placement, size, and style details.</li>
              <li>Tami follows up to schedule and confirm.</li>
            </ol>
            <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
              <strong className="text-[var(--foreground)]">Tip:</strong> The more detail you provide (style, size, placement), the faster scheduling goes.
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
