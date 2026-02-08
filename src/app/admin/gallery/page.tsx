import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import GalleryManagerClient from "./GalleryManagerClient";

export default async function AdminGalleryPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

  if (!isAdmin) {
    redirect("/artist/login");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Gallery Management</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          View and manage all gallery images. Click on an image to delete it.
        </p>
      </div>
      <GalleryManagerClient />
    </main>
  );
}
