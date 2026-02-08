// SMS templates
export const smsTemplates = {
  appointmentConfirmation: (data: {
    appointmentDate: string;
    appointmentTime: string;
    artistName: string;
  }) =>
    `Hi! Your appointment at APT Studio is confirmed for ${data.appointmentDate} at ${data.appointmentTime} with ${data.artistName}. Please arrive 10 min early. Reply STOP to opt out.`,

  appointmentReminder: (data: { appointmentDate: string; appointmentTime: string }) =>
    `Reminder: You have an appointment tomorrow (${data.appointmentDate}) at ${data.appointmentTime}. Please arrive 10 min early. Reply STOP to opt out.`,

  requestReceived: () =>
    `Thank you for your appointment request! We'll contact you within 24-48 hours to confirm. Reply STOP to opt out.`,
};

// SMS sending function (integrate with Twilio or similar)
export async function sendSMS(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    console.warn("Twilio not configured. SMS will not be sent.");
    return { success: false, error: "SMS not configured" };
  }

  try {
    // In production, use Twilio SDK:
    // const client = require('twilio')(twilioAccountSid, twilioAuthToken);
    // await client.messages.create({
    //   body: message,
    //   from: twilioPhoneNumber,
    //   to: to
    // });

    console.log(`[SMS] To: ${to}, Message: ${message}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to send SMS:", error);
    return { success: false, error: error.message };
  }
}
