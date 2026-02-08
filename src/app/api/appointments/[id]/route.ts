import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/appointments/[id] - Get appointment details
export async function GET(
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

    // Get the tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
        service: true,
        request: {
          include: {
            customer: true,
          },
        },
        files: true,
        reminders: {
          orderBy: {
            sendAt: "asc",
          },
        },
      },
    });

    if (!appointment || appointment.tenantId !== tenant.id) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Check if artist can view this appointment
    if (!isAdmin && artistSlug) {
      const artist = await prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          email: { contains: artistSlug },
        },
      });
      if (artist && appointment.artistId !== artist.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
  }
}

// PATCH /api/appointments/[id] - Update appointment
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      title,
      startAt,
      endAt,
      status,
      artistId,
      locationId,
      serviceId,
      notesCustomer,
      notesInternal,
    } = body;

    // Get the tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (startAt) updateData.startAt = new Date(startAt);
    if (endAt) updateData.endAt = new Date(endAt);
    if (status) updateData.status = status;
    if (artistId) updateData.artistId = artistId;
    if (locationId !== undefined) updateData.locationId = locationId;
    if (serviceId !== undefined) updateData.serviceId = serviceId;
    if (notesCustomer !== undefined) updateData.notesCustomer = notesCustomer;
    if (notesInternal !== undefined) updateData.notesInternal = notesInternal;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
        service: true,
        request: {
          include: {
            customer: true,
          },
        },
      },
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

// DELETE /api/appointments/[id] - Cancel/delete appointment
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Soft delete by setting deletedAt
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "canceled",
      },
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 });
  }
}
