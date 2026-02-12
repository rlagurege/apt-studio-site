import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/artist/all-appointments - Returns ALL appointments (for calendar view showing all artists)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const artistSlug = (session?.user as { artistSlug?: string } | undefined)?.artistSlug;

    if (!artistSlug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Prisma is available (database configured)
    try {
      // Get the tenant
      const tenant = await prisma.tenant.findFirst({
        where: { slug: "apt-studios" },
      });

      if (!tenant) {
        return NextResponse.json({ appointments: [] });
      }

      // Get ALL appointments (not just this artist's) so calendar shows everyone's schedule
      const appointments = await prisma.appointment.findMany({
        where: {
          tenantId: tenant.id,
          deletedAt: null,
        },
        include: {
          customer: true,
          artist: {
            select: {
              id: true,
              name: true,
              email: true,
              color: true,
            },
          },
          location: true,
          service: true,
        },
        orderBy: {
          startAt: "asc",
        },
      });

      return NextResponse.json({
        appointments: appointments.map((apt) => ({
          id: apt.id,
          title: apt.title,
          startAt: apt.startAt.toISOString(),
          endAt: apt.endAt.toISOString(),
          status: apt.status,
          customerName: apt.customer?.name || apt.guestName || "Guest",
          customerContact: apt.customer?.phone || apt.customer?.email || apt.guestPhone || apt.guestEmail || "",
          location: apt.location?.name || null,
          service: apt.service?.name || null,
          notesCustomer: apt.notesCustomer,
          notesInternal: apt.notesInternal,
          artist: {
            id: apt.artist.id,
            name: apt.artist.name,
            email: apt.artist.email,
            color: apt.artist.color,
          },
        })),
      });
    } catch (prismaError: any) {
      // If Prisma is not initialized or database is not configured, return empty arrays
      if (prismaError?.message?.includes("not initialized") || prismaError?.code === "P1001") {
        console.warn("[All Appointments] Database not configured, returning empty appointments");
        return NextResponse.json({ appointments: [] });
      }
      throw prismaError;
    }
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    return NextResponse.json({ appointments: [] });
  }
}
