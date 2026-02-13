"use client";

import { useMemo, useState } from "react";
import type { Artist } from "@/lib/types";

type Props = {
  artists: Artist[];
  initialArtistSlug?: string;
};

export default function BookingRequestForm({ artists, initialArtistSlug }: Props) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const initialArtist = useMemo(() => {
    if (!initialArtistSlug) return "";
    const found = artists.find((a) => a.slug === initialArtistSlug);
    return found ? found.slug : "";
  }, [artists, initialArtistSlug]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const fd = new FormData(form);

    const name = String(fd.get("name") || "").trim();
    const contact = String(fd.get("contact") || "").trim();
    const artistSlug = String(fd.get("artistSlug") || "").trim();
    const styleNotes = String(fd.get("styleNotes") || "").trim();

    if (!name || !contact || !artistSlug || !styleNotes) {
      setStatus("error");
      setErrorMsg("Please fill name, contact, artist, and details.");
      return;
    }

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Request failed");
      }

      setStatus("success");
      form.reset();
      
      // Scroll to success message
      setTimeout(() => {
        const successMsg = document.querySelector('[data-success-message]');
        if (successMsg) {
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 transition-colors";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-lg">
      <form className="space-y-6" onSubmit={onSubmit}>
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Your info</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Name</label>
              <input id="name" name="name" className={inputClass} placeholder="Your name" required />
            </div>
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email or phone</label>
              <input id="contact" name="contact" className={inputClass} placeholder="Email or phone" required />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Artist & tattoo details</h2>
          <div>
            <label htmlFor="artistSlug" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Artist</label>
            <select id="artistSlug" name="artistSlug" defaultValue={initialArtist} className={inputClass} required>
              <option value="" disabled>Choose an artist</option>
              {artists.map((a) => (
                <option key={a.slug} value={a.slug}>{a.name} — {a.role}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="placement" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Placement</label>
              <input id="placement" name="placement" className={inputClass} placeholder="e.g. forearm, calf" required />
            </div>
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Approx. size</label>
              <input id="size" name="size" className={inputClass} placeholder='e.g. 4×6 inches' required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Budget (optional)</label>
              <input id="budget" name="budget" className={inputClass} placeholder="Budget" />
            </div>
            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Timeline (optional)</label>
              <input id="timeline" name="timeline" className={inputClass} placeholder="e.g. ASAP, next month" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <label htmlFor="styleNotes" className="block text-sm font-medium text-[var(--foreground)]">Describe your idea</label>
          <textarea
            id="styleNotes"
            name="styleNotes"
            className={`${inputClass} min-h-[120px] resize-y`}
            placeholder="Style, color vs black & grey, reference notes, placement details—anything that helps."
            rows={5}
            required
          />
        </section>

        <section className="space-y-2">
          <label htmlFor="referenceImage" className="block text-sm font-medium text-[var(--foreground)]">Reference image</label>
          <input
            id="referenceImage"
            name="referenceImage"
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white file:cursor-pointer focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
          <p className="text-xs text-[var(--muted)]">Optional but recommended (jpg, png, webp).</p>
        </section>

        <div className="pt-2">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-4 text-base font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {status === "submitting" ? "Submitting..." : "Submit request"}
          </button>
        </div>

        {status === "success" && (
          <div 
            data-success-message
            className="rounded-xl border border-green-600/50 bg-green-900/30 p-4 text-sm text-green-200 text-center"
          >
            <p className="font-semibold mb-2">✓ Request received!</p>
            <p>Tami will contact you soon to schedule your appointment.</p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-xl border border-red-600/50 bg-red-900/30 p-4 text-sm text-red-200 text-center">
            {errorMsg || "Error submitting request."}
          </div>
        )}
      </form>
    </div>
  );
}
