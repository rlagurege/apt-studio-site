import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/availability - Get artist availability blocks
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;
    const artistSlug = (session?.user as { artistSlug?: string } | undefined)?.artistSlug;

    if (!isAdmin && !artistSlug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const artistId = searchParams.get("artistId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const where: any = {
      tenantId: tenant.id,
    };

    if (artistId) {
      where.artistId = artistId;
    } else if (artistSlug && !isAdmin) {
      const artist = await prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          email: { contains: artistSlug },
        },
      });
      if (artist) {
        where.artistId = artist.id;
      }
    }

    if (startDate && endDate) {
      where.startAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const blocks = await prisma.availabilityBlock.findMany({
      where,
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    return NextResponse.json({ blocks });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}

// POST /api/availability - Create availability block
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;
    const artistSlug = (session?.user as { artistSlug?: string } | undefined)?.artistSlug;

    if (!isAdmin && !artistSlug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { artistId, startAt, endAt, type, notes } = body;

    if (!artistId || !startAt || !endAt || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Check if artist is trying to block their own availability
    if (artistSlug && !isAdmin) {
      const artist = await prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          email: { contains: artistSlug },
        },
      });
      if (artist?.id !== artistId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const block = await prisma.availabilityBlock.create({
      data: {
        tenantId: tenant.id,
        artistId,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        type,
        notes: notes || null,
      },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ block });
  } catch (error) {
    console.error("Error creating availability block:", error);
    return NextResponse.json({ error: "Failed to create availability block" }, { status: 500 });
  }
}
