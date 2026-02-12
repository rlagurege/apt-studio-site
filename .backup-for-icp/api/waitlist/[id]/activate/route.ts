import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/waitlist/[id]/activate - Move waitlist entry to active scheduling
export async function POST(
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

    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Update request status to "contacting" to move it to active scheduling
    const request = await prisma.appointmentRequest.update({
      where: { id },
      data: {
        status: "contacting",
        lastContactedAt: new Date(),
      },
    });

    if (request.tenantId !== tenant.id) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error("Error activating waitlist entry:", error);
    return NextResponse.json({ error: "Failed to activate waitlist entry" }, { status: 500 });
  }
}
