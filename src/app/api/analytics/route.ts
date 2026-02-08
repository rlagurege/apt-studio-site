import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfMonth, endOfMonth, parse, format } from "date-fns";

// GET /api/analytics - Get analytics data
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month") || format(new Date(), "yyyy-MM");
    const monthStart = startOfMonth(parse(monthParam, "yyyy-MM", new Date()));
    const monthEnd = endOfMonth(monthStart);

    // Total appointments
    const totalAppointments = await prisma.appointment.count({
      where: {
        tenantId: tenant.id,
        deletedAt: null,
        startAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Total requests
    const totalRequests = await prisma.appointmentRequest.count({
      where: {
        tenantId: tenant.id,
        deletedAt: null,
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Appointments by artist
    const appointmentsByArtistRaw = await prisma.appointment.groupBy({
      by: ["artistId"],
      where: {
        tenantId: tenant.id,
        deletedAt: null,
        startAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _count: {
        id: true,
      },
    });

    const artistIds = appointmentsByArtistRaw.map((a) => a.artistId);
    const artists = await prisma.user.findMany({
      where: {
        id: { in: artistIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const artistMap = new Map(artists.map((a) => [a.id, a.name]));
    const appointmentsByArtist = appointmentsByArtistRaw.map((item) => ({
      artist: artistMap.get(item.artistId) || "Unknown",
      count: item._count.id,
    }));

    // Requests by status
    const requestsByStatusRaw = await prisma.appointmentRequest.groupBy({
      by: ["status"],
      where: {
        tenantId: tenant.id,
        deletedAt: null,
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _count: {
        id: true,
      },
    });

    const requestsByStatus = requestsByStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    // Appointments by month (last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(monthStart);
      const count = await prisma.appointment.count({
        where: {
          tenantId: tenant.id,
          deletedAt: null,
          startAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });
      months.push({
        month: format(monthStart, "MMM yyyy"),
        count,
      });
    }

    return NextResponse.json({
      totalAppointments,
      totalRequests,
      appointmentsByArtist,
      requestsByStatus,
      appointmentsByMonth: months,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

