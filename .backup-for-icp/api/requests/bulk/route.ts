import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/requests/bulk - Bulk update request statuses
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { requestIds, status } = body;

    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      return NextResponse.json({ error: "Invalid request IDs" }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Update all requests
    const result = await prisma.appointmentRequest.updateMany({
      where: {
        id: { in: requestIds },
        tenantId: tenant.id,
        deletedAt: null,
      },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error) {
    console.error("Error bulk updating requests:", error);
    return NextResponse.json({ error: "Failed to update requests" }, { status: 500 });
  }
}
