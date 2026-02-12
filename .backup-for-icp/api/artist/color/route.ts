import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/artist/color?slug=artist-slug
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug required" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ color: null });
    }

    const artist = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        OR: [
          { email: { contains: slug } },
          { email: { equals: `${slug}@apt.com` } },
        ],
      },
      select: { color: true },
    });

    return NextResponse.json({ color: artist?.color || null });
  } catch (error) {
    console.error("Error fetching artist color:", error);
    return NextResponse.json({ color: null });
  }
}

// POST /api/artist/color - Update artist color
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const artistSlug = (session?.user as { artistSlug?: string } | undefined)?.artistSlug;

    if (!artistSlug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { slug, color } = body;

    // Verify the slug matches the logged-in artist
    if (slug !== artistSlug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const artist = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        OR: [
          { email: { contains: slug } },
          { email: { equals: `${slug}@apt.com` } },
        ],
      },
    });

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    // Validate color format (hex code)
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json({ error: "Invalid color format" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: artist.id },
      data: { color: color || null },
    });

    return NextResponse.json({ success: true, color });
  } catch (error) {
    console.error("Error updating artist color:", error);
    return NextResponse.json({ error: "Failed to update color" }, { status: 500 });
  }
}
