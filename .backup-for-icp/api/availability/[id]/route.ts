import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// DELETE /api/availability/[id] - Delete availability block
export async function DELETE(
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

    const block = await prisma.availabilityBlock.findUnique({
      where: { id },
      include: { artist: true },
    });

    if (!block || block.tenantId !== tenant.id) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    // Check if artist is trying to delete their own block
    if (artistSlug && !isAdmin) {
      const artist = await prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          email: { contains: artistSlug },
        },
      });
      if (artist?.id !== block.artistId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    await prisma.availabilityBlock.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting availability block:", error);
    return NextResponse.json({ error: "Failed to delete availability block" }, { status: 500 });
  }
}
