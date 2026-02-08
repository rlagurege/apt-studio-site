import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

let client: twilio.Twilio | null = null;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

export async function sendSMS(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  if (!client || !fromPhone) {
    return { success: false, error: "Twilio not configured" };
  }

  try {
    // Clean phone number (remove non-digits, add +1 if needed)
    const cleanPhone = to.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("1") ? `+${cleanPhone}` : `+1${cleanPhone}`;

    await client.messages.create({
      body: message,
      from: fromPhone,
      to: formattedPhone,
    });

    return { success: true };
  } catch (error) {
    console.error("[Twilio] SMS error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to send SMS" };
  }
}

export async function makeCall(to: string, message?: string): Promise<{ success: boolean; error?: string; callSid?: string }> {
  if (!client || !fromPhone) {
    return { success: false, error: "Twilio not configured" };
  }

  try {
    // Clean phone number
    const cleanPhone = to.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("1") ? `+${cleanPhone}` : `+1${cleanPhone}`;

    // For voice calls with text-to-speech, you'd use TwiML
    // For now, just initiate a call
    const call = await client.calls.create({
      from: fromPhone,
      to: formattedPhone,
      url: message 
        ? `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/twilio/voice?message=${encodeURIComponent(message)}`
        : undefined,
      twiml: message 
        ? `<Response><Say voice="alice">${message}</Say></Response>`
        : undefined,
    });

    return { success: true, callSid: call.sid };
  } catch (error) {
    console.error("[Twilio] Call error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to make call" };
  }
}
