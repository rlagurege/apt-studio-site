import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

// GET /api/artist/scheduled - Returns scheduled appointments for the artist
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
        return NextResponse.json({ appointments: [], todayAppointments: [] });
      }

      // Find artist user by matching email or name with slug
      const artist = await prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          OR: [
            { email: { contains: artistSlug } },
            { name: { contains: artistSlug } },
          ],
        },
      });

      if (!artist) {
        return NextResponse.json({ appointments: [], todayAppointments: [] });
      }

      // Get all appointments for this artist
      const appointments = await prisma.appointment.findMany({
        where: {
          tenantId: tenant.id,
          artistId: artist.id,
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
          request: {
            include: {
              customer: true,
            },
          },
        },
        orderBy: {
          startAt: "asc",
        },
      });

      // Get today's appointments
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);

      const todayAppointments = appointments.filter((apt) => {
        const startDate = new Date(apt.startAt);
        return startDate >= todayStart && startDate <= todayEnd;
      });

      return NextResponse.json({
        artistId: artist.id, // Include artist ID for availability manager
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
          artistColor: apt.artist?.color || null,
          artistId: apt.artistId,
        })),
        todayAppointments: todayAppointments.map((apt) => ({
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
          artistColor: apt.artist?.color || null,
        })),
      });
    } catch (prismaError: any) {
      // If Prisma is not initialized or database is not configured, return empty arrays
      if (prismaError?.message?.includes("not initialized") || prismaError?.code === "P1001") {
        console.warn("[Scheduled] Database not configured, returning empty appointments");
        return NextResponse.json({ appointments: [], todayAppointments: [] });
      }
      // Re-throw other Prisma errors
      throw prismaError;
    }
  } catch (error) {
    console.error("Error fetching scheduled appointments:", error);
    // Return empty arrays instead of error to allow dashboard to load
    return NextResponse.json({ appointments: [], todayAppointments: [] });
  }
}
