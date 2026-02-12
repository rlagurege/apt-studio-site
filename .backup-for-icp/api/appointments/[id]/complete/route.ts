import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/appointments/[id]/complete - Mark appointment as completed
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;
    const artistSlug = (session?.user as { artistSlug?: string } | undefined)?.artistSlug;

    if (!isAdmin && !artistSlug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { artist: true },
    });

    if (!appointment || appointment.tenantId !== tenant.id) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Check if artist is trying to complete their own appointment
    if (artistSlug && !isAdmin) {
      const artist = await prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          email: { contains: artistSlug },
        },
      });
      if (appointment.artistId !== artist?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: "completed" },
      include: {
        customer: true,
        artist: true,
        service: true,
      },
    });

    return NextResponse.json({ appointment: updated });
  } catch (error) {
    console.error("Error completing appointment:", error);
    return NextResponse.json({ error: "Failed to complete appointment" }, { status: 500 });
  }
}
