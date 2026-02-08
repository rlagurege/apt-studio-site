import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-0">
      <section className="relative min-h-[480px] overflow-hidden rounded-b-2xl border-b border-[var(--border)] bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/hero-cover.png"
            alt=""
            fill
            className="object-contain object-center"
            sizes="100vw"
            priority
          />
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--card)] px-4 py-12">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
            About {SITE.name}
          </h1>
          <p className="text-lg leading-relaxed text-[var(--foreground)]">
            For the past 13 years, Addictive Pain Tattoo has been a place where quality comes first. We pride ourselves on producing tattoo work that meets — and exceeds — high industry standards. We don't believe in cutting corners. Every piece is approached with care, precision, and a commitment to longevity, ensuring your tattoo looks just as strong years down the line as it does the day it's finished.
          </p>
          </div>

        <div className="mx-auto mt-10 flex max-w-2xl justify-center">
            <Link
              href="/appointments"
              className="rounded-xl bg-red-600 px-6 py-3 text-sm font-medium text-white shadow-lg hover:bg-red-500"
            >
              Request appointment
            </Link>
        </div>
      </section>
    </main>
  );
}
