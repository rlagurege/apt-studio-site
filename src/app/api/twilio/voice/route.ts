import { NextResponse } from "next/server";

// Twilio webhook endpoint for voice calls
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const message = searchParams.get("message") || "Hello, this is a call from APT Studio.";

  // Return TwiML for Twilio to read the message
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${message}</Say>
</Response>`;

  return new NextResponse(twiml, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
