import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format as formatDate } from "date-fns";

// GET /api/export/appointments - Export appointments as CSV
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const exportFormat = searchParams.get("format") || "csv";

    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const where: any = {
      tenantId: tenant.id,
      deletedAt: null,
    };

    if (startDate && endDate) {
      where.startAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        artist: true,
        location: true,
        service: true,
      },
      orderBy: {
        startAt: "asc",
      },
    });

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "Date",
        "Time",
        "Customer",
        "Artist",
        "Title",
        "Status",
        "Location",
        "Service",
        "Email",
        "Phone",
      ];

      const rows = appointments.map((apt) => [
        formatDate(new Date(apt.startAt), "yyyy-MM-dd"),
        formatDate(new Date(apt.startAt), "HH:mm"),
        apt.customer?.name || apt.guestName || "",
        apt.artist.name,
        apt.title,
        apt.status,
        apt.location?.name || "",
        apt.service?.name || "",
        apt.customer?.email || apt.guestEmail || "",
        apt.customer?.phone || apt.guestPhone || "",
      ]);

      const csv = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="appointments-${formatDate(new Date(), "yyyy-MM-dd")}.csv"`,
        },
      });
    }

    // JSON format
    return NextResponse.json({
      appointments: appointments.map((apt) => ({
        id: apt.id,
        date: formatDate(new Date(apt.startAt), "yyyy-MM-dd"),
        time: formatDate(new Date(apt.startAt), "HH:mm"),
        customer: apt.customer?.name || apt.guestName,
        artist: apt.artist.name,
        title: apt.title,
        status: apt.status,
        location: apt.location?.name,
        service: apt.service?.name,
        email: apt.customer?.email || apt.guestEmail,
        phone: apt.customer?.phone || apt.guestPhone,
      })),
    });
  } catch (error) {
    console.error("Error exporting appointments:", error);
    return NextResponse.json({ error: "Failed to export appointments" }, { status: 500 });
  }
}
