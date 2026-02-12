import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { sendSMS } from "@/lib/twilio";
import fs from "fs";
import path from "path";

type AppointmentRow = {
  id: string;
  createdAtISO: string;
  artistSlug: string;
  name: string;
  contact: string;
  placement: string;
  size: string;
  styleNotes: string;
  budget?: string;
  timeline?: string;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { appointmentId, reminderType, customMessage } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: "Missing appointmentId" }, { status: 400 });
    }

    // Load appointment
    const inboxFile = path.join(process.cwd(), "data", "appointment_requests.jsonl");
    if (!fs.existsSync(inboxFile)) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const raw = fs.readFileSync(inboxFile, "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    let appointment: AppointmentRow | null = null;

    for (const line of lines) {
      try {
        const row = JSON.parse(line) as AppointmentRow;
        if (row.id === appointmentId) {
          appointment = row;
          break;
        }
      } catch {
        // skip invalid lines
      }
    }

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Generate message based on type
    let message = customMessage;
    if (!message) {
      switch (reminderType) {
        case "confirmation":
          message = `Hi ${appointment.name}, this is Tammi from APT Studio. We received your appointment request for ${appointment.placement}. We'll contact you soon to schedule.`;
          break;
        case "reminder":
          message = `Hi ${appointment.name}, this is Tammi from APT Studio. Reminder: Your appointment is coming up. Please confirm your availability.`;
          break;
        case "followup":
          message = `Hi ${appointment.name}, this is Tammi from APT Studio. Following up on your appointment request. Please reply to confirm.`;
          break;
        default:
          message = `Hi ${appointment.name}, this is Tammi from APT Studio regarding your appointment request.`;
      }
    }

    // Check if contact is a phone number
    const isPhone = /[\d-()]/.test(appointment.contact);
    if (!isPhone) {
      return NextResponse.json({ error: "Contact is not a phone number" }, { status: 400 });
    }

    const result = await sendSMS(appointment.contact, message);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Reminder sent successfully",
        sentTo: appointment.contact,
      });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("[Reminders] Error:", error);
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 });
  }
}
