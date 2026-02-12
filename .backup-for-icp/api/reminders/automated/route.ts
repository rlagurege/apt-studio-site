import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addDays, addHours, isBefore } from "date-fns";
import { sendEmail, emailTemplates } from "@/lib/email";
import { sendSMS, smsTemplates } from "@/lib/sms";
import { format } from "date-fns";

// POST /api/reminders/automated - Send automated reminders for upcoming appointments
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const now = new Date();
    const tomorrow = addDays(now, 1);
    const tomorrowEnd = addDays(tomorrow, 1);

    // Find appointments tomorrow that haven't been reminded
    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId: tenant.id,
        deletedAt: null,
        status: { in: ["tentative", "confirmed"] },
        startAt: {
          gte: tomorrow,
          lt: tomorrowEnd,
        },
      },
      include: {
        customer: true,
        artist: true,
        location: true,
        reminders: true,
      },
    });

    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{ appointmentId: string; customer: string; method: string; success: boolean }>,
    };

    for (const appointment of appointments) {
      // Check if reminder already sent
      const hasReminder = appointment.reminders.some(
        (r) => r.type === "email" && r.status === "sent"
      );

      if (hasReminder) {
        results.skipped++;
        continue;
      }

      const customerEmail = appointment.customer?.email || appointment.guestEmail;
      const customerPhone = appointment.customer?.phone || appointment.guestPhone;
      const customerName = appointment.customer?.name || appointment.guestName || "Customer";

      let emailSent = false;
      let smsSent = false;

      // Send email reminder
      if (customerEmail) {
        try {
          const emailTemplate = emailTemplates.appointmentReminder({
            customerName,
            appointmentDate: format(new Date(appointment.startAt), "MMMM d, yyyy"),
            appointmentTime: format(new Date(appointment.startAt), "h:mm a"),
            artistName: appointment.artist.name,
          });

          emailSent = await sendEmail(customerEmail, emailTemplate.subject, emailTemplate.html);

          if (emailSent) {
            // Create reminder record
            await prisma.reminder.create({
              data: {
                tenantId: tenant.id,
                appointmentId: appointment.id,
                type: "email",
                sendAt: now,
                status: "sent",
              },
            });
          }
        } catch (error) {
          console.error(`Failed to send email reminder for appointment ${appointment.id}:`, error);
        }
      }

      // Send SMS reminder
      if (customerPhone) {
        try {
          const smsMessage = smsTemplates.appointmentReminder({
            appointmentDate: format(new Date(appointment.startAt), "MMM d, yyyy"),
            appointmentTime: format(new Date(appointment.startAt), "h:mm a"),
            artistName: appointment.artist.name,
          });

          smsSent = await sendSMS(customerPhone, smsMessage);

          if (smsSent) {
            await prisma.reminder.create({
              data: {
                tenantId: tenant.id,
                appointmentId: appointment.id,
                type: "sms",
                sendAt: now,
                status: "sent",
              },
            });
          }
        } catch (error) {
          console.error(`Failed to send SMS reminder for appointment ${appointment.id}:`, error);
        }
      }

      if (emailSent || smsSent) {
        results.sent++;
        results.details.push({
          appointmentId: appointment.id,
          customer: customerName,
          method: emailSent && smsSent ? "email+sms" : emailSent ? "email" : "sms",
          success: true,
        });
      } else {
        results.failed++;
        results.details.push({
          appointmentId: appointment.id,
          customer: customerName,
          method: "none",
          success: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("Error sending automated reminders:", error);
    return NextResponse.json({ error: "Failed to send reminders" }, { status: 500 });
  }
}
