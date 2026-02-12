import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/appointments/conflicts - Check for scheduling conflicts
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const artistId = searchParams.get("artistId");
    const startAt = searchParams.get("startAt");
    const endAt = searchParams.get("endAt");
    const excludeId = searchParams.get("excludeId"); // For editing existing appointments

    if (!artistId || !startAt || !endAt) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const start = new Date(startAt);
    const end = new Date(endAt);

    // Also check availability blocks
    const availabilityBlocks = await prisma.availabilityBlock.findMany({
      where: {
        tenantId: tenant.id,
        artistId,
        type: "blocked", // Only "blocked" prevents scheduling
        OR: [
          {
            startAt: { lte: start },
            endAt: { gt: start },
          },
          {
            startAt: { lt: end },
            endAt: { gte: end },
          },
          {
            startAt: { gte: start },
            endAt: { lte: end },
          },
        ],
      },
    });

    // Find overlapping appointments for the same artist
    const conflicts = await prisma.appointment.findMany({
      where: {
        tenantId: tenant.id,
        artistId,
        deletedAt: null,
        status: { in: ["tentative", "confirmed"] },
        ...(excludeId ? { id: { not: excludeId } } : {}),
        OR: [
          // Appointment starts during another appointment
          {
            startAt: { lte: start },
            endAt: { gt: start },
          },
          // Appointment ends during another appointment
          {
            startAt: { lt: end },
            endAt: { gte: end },
          },
          // Appointment completely contains another appointment
          {
            startAt: { gte: start },
            endAt: { lte: end },
          },
        ],
      },
      include: {
        customer: true,
        artist: true,
      },
    });

    const hasConflict = conflicts.length > 0 || availabilityBlocks.length > 0;

    return NextResponse.json({
      hasConflict,
      conflicts: conflicts.map((apt) => ({
        id: apt.id,
        title: apt.title,
        startAt: apt.startAt,
        endAt: apt.endAt,
        customer: apt.customer?.name || apt.guestName,
        artist: apt.artist.name,
        type: "appointment",
      })),
      availabilityBlocks: availabilityBlocks.map((block) => ({
        id: block.id,
        title: `Availability Block: ${block.type}`,
        startAt: block.startAt,
        endAt: block.endAt,
        type: "availability",
      })),
    });
  } catch (error) {
    console.error("Error checking conflicts:", error);
    return NextResponse.json({ error: "Failed to check conflicts" }, { status: 500 });
  }
}
