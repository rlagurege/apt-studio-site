import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { sendSMS, makeCall } from "@/lib/twilio";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, phone, message, appointmentId } = body;

    if (!phone || !message) {
      return NextResponse.json({ error: "Missing phone or message" }, { status: 400 });
    }

    let result;
    if (type === "sms") {
      result = await sendSMS(phone, message);
    } else if (type === "call") {
      result = await makeCall(phone, message);
    } else {
      return NextResponse.json({ error: "Invalid type. Use 'sms' or 'call'" }, { status: 400 });
    }

    if (result.success) {
      // Log the contact attempt (optional - save to database)
      return NextResponse.json({ 
        success: true, 
        message: type === "sms" ? "SMS sent successfully" : "Call initiated successfully",
        callSid: (result as { callSid?: string }).callSid,
      });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("[Admin Contact] Error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
