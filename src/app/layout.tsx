import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
// import "@/lib/env-validation"; // Validate environment variables - disabled for local dev

export const metadata = {
  title: "APT Studio — Addictive Pain Tattoo",
  description:
    "Artist profiles, portfolio, and appointment requests for Addictive Pain Tattoo (APT Studio) in Gloversville, NY.",
  openGraph: {
    title: "APT Studio — Addictive Pain Tattoo",
    description:
      "Artist profiles, portfolio, and appointment requests for Addictive Pain Tattoo (APT Studio) in Gloversville, NY.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f1f1f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[var(--background)]">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff6b6b" />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <Providers>
          <Nav />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
