import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/waitlist - Get waitlist entries (requests that need scheduling but artist is booked)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const artistSlug = searchParams.get("artist");

    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Get requests that are in "contacting" or "requested" status
    // These are potential waitlist candidates
    const where: any = {
      tenantId: tenant.id,
      status: { in: ["requested", "contacting"] },
      deletedAt: null,
    };

    if (artistSlug && artistSlug !== "all") {
      const artist = await prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          email: { contains: artistSlug },
        },
      });
      if (artist) {
        where.preferredArtistId = artist.id;
      }
    }

    const requests = await prisma.appointmentRequest.findMany({
      where,
      include: {
        customer: true,
        preferredArtist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "asc" },
      ],
    });

    const waitlist = requests.map((req) => ({
      id: req.id,
      customerName: req.customer?.name || req.guestName || "Unknown",
      customerEmail: req.customer?.email || req.guestEmail || "",
      customerPhone: req.customer?.phone || req.guestPhone || "",
      preferredArtist: req.preferredArtist?.name || "Any Artist",
      description: req.description,
      createdAt: req.createdAt,
      priority: req.priority,
    }));

    return NextResponse.json({ waitlist });
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    return NextResponse.json({ error: "Failed to fetch waitlist" }, { status: 500 });
  }
}
