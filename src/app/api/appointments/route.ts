import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/email";
import { sendSMS, smsTemplates } from "@/lib/sms";
import { format } from "date-fns";

// GET /api/appointments - Returns appointments for scheduling board + artist view
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const artistId = searchParams.get("artistId");

    // Get the tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ appointments: [] });
    }

    // Build where clause
    const where: any = {
      tenantId: tenant.id,
      deletedAt: null,
    };

    // Filter by artist if provided
    if (artistId) {
      where.artistId = artistId;
    } else {
      // If user is an artist, filter to their appointments
      const artistSlug = (session?.user as { artistSlug?: string } | undefined)?.artistSlug;
      if (artistSlug) {
        const artist = await prisma.user.findFirst({
          where: {
            tenantId: tenant.id,
            email: { contains: artistSlug },
          },
        });
        if (artist) {
          where.artistId = artist.id;
        }
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
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
      orderBy: {
        startAt: "asc",
      },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

// POST /api/appointments - Creates an appointment from a request (Tammy "Schedule" button)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      requestId,
      artistId,
      locationId,
      serviceId,
      title,
      startAt,
      endAt,
      timezone,
      notesCustomer,
      notesInternal,
    } = body;

    if (!artistId || !startAt || !endAt || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get the tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Get request if provided
    let request = null;
    let customerId = null;
    let guestName = null;
    let guestEmail = null;
    let guestPhone = null;

    if (requestId) {
      request = await prisma.appointmentRequest.findUnique({
        where: { id: requestId },
        include: { customer: true },
      });

      if (request) {
        customerId = request.customerId || null;
        guestName = request.guestName || null;
        guestEmail = request.guestEmail || null;
        guestPhone = request.guestPhone || null;
      }
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        requestId: requestId || null,
        customerId,
        guestName,
        guestEmail,
        guestPhone,
        artistId,
        locationId: locationId || null,
        serviceId: serviceId || null,
        title,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        timezone: timezone || "America/New_York",
        status: "tentative",
        notesCustomer: notesCustomer || null,
        notesInternal: notesInternal || null,
        createdByUserId: (session?.user as { id?: string } | undefined)?.id || null,
      },
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

    // Update request status if linked
    if (request) {
      await prisma.appointmentRequest.update({
        where: { id: requestId },
        data: { status: "scheduled" },
      });

      // Create audit event
      await prisma.requestEvent.create({
        data: {
          tenantId: tenant.id,
          requestId,
          type: "appointment_linked",
          meta: {
            appointmentId: appointment.id,
          },
          actorUserId: (session?.user as { id?: string } | undefined)?.id || null,
        },
      });
    }

    // Send email and SMS notifications
    const customerEmail = appointment.customer?.email || appointment.guestEmail;
    const customerPhone = appointment.customer?.phone || appointment.guestPhone;
    const customerName = appointment.customer?.name || appointment.guestName || "Customer";

    if (customerEmail) {
      const emailTemplate = emailTemplates.appointmentConfirmation({
        customerName,
        appointmentDate: format(new Date(appointment.startAt), "MMMM d, yyyy"),
        appointmentTime: format(new Date(appointment.startAt), "h:mm a"),
        artistName: appointment.artist.name,
        location: appointment.location?.name,
      });
      sendEmail(customerEmail, emailTemplate.subject, emailTemplate.html).catch((err) =>
        console.error("Failed to send confirmation email:", err)
      );
    }

    if (customerPhone) {
      const smsMessage = smsTemplates.appointmentConfirmation({
        appointmentDate: format(new Date(appointment.startAt), "MMM d, yyyy"),
        appointmentTime: format(new Date(appointment.startAt), "h:mm a"),
        artistName: appointment.artist.name,
      });
      sendSMS(customerPhone, smsMessage).catch((err) =>
        console.error("Failed to send confirmation SMS:", err)
      );
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
