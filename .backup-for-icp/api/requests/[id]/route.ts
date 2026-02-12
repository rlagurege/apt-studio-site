import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/requests/[id] - Get request details with files and events
export async function GET(
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

    const request = await prisma.appointmentRequest.findUnique({
      where: { id },
      include: {
        customer: true,
        preferredArtist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!request || request.tenantId !== tenant.id) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Get files for this request
    const files = await prisma.file.findMany({
      where: {
        tenantId: tenant.id,
        requestId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get events for this request
    const events = await prisma.requestEvent.findMany({
      where: {
        tenantId: tenant.id,
        requestId: id,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ request, files, events });
  } catch (error) {
    console.error("Error fetching request details:", error);
    return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 });
  }
}

// PATCH /api/requests/[id] - Update request status or other fields
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
    const { status, priority, internalNotes } = body;

    // Get the tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
    if (status) updateData.lastContactedAt = new Date();

    const request = await prisma.appointmentRequest.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        preferredArtist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create audit event if status changed
    if (status) {
      await prisma.requestEvent.create({
        data: {
          tenantId: tenant.id,
          requestId: id,
          type: "status_changed",
          meta: {
            oldStatus: request.status,
            newStatus: status,
          },
          actorUserId: (session?.user as { id?: string } | undefined)?.id || null,
        },
      });
    }

    return NextResponse.json({ request });
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
