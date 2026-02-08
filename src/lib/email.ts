import nodemailer from "nodemailer";

// Email templates
export const emailTemplates = {
  appointmentConfirmation: (data: {
    customerName: string;
    appointmentDate: string;
    appointmentTime: string;
    artistName: string;
    location?: string;
  }) => ({
    subject: `Appointment Confirmed - ${data.appointmentDate}`,
    html: `
      <h2>Your Appointment is Confirmed!</h2>
      <p>Hi ${data.customerName},</p>
      <p>Your appointment at Addictive Pain Tattoo has been confirmed:</p>
      <ul>
        <li><strong>Date:</strong> ${data.appointmentDate}</li>
        <li><strong>Time:</strong> ${data.appointmentTime}</li>
        <li><strong>Artist:</strong> ${data.artistName}</li>
        ${data.location ? `<li><strong>Location:</strong> ${data.location}</li>` : ""}
      </ul>
      <p>Please arrive 10 minutes early. If you need to reschedule or cancel, please contact us at least 48 hours in advance.</p>
      <p>We look forward to seeing you!</p>
      <p>— Addictive Pain Tattoo</p>
    `,
  }),

  appointmentReminder: (data: {
    customerName: string;
    appointmentDate: string;
    appointmentTime: string;
    artistName: string;
  }) => ({
    subject: `Reminder: Your Appointment Tomorrow - ${data.appointmentDate}`,
    html: `
      <h2>Appointment Reminder</h2>
      <p>Hi ${data.customerName},</p>
      <p>This is a reminder that you have an appointment tomorrow:</p>
      <ul>
        <li><strong>Date:</strong> ${data.appointmentDate}</li>
        <li><strong>Time:</strong> ${data.appointmentTime}</li>
        <li><strong>Artist:</strong> ${data.artistName}</li>
      </ul>
      <p>Please arrive 10 minutes early. If you need to reschedule, please contact us as soon as possible.</p>
      <p>See you tomorrow!</p>
      <p>— Addictive Pain Tattoo</p>
    `,
  }),

  requestReceived: (data: { customerName: string }) => ({
    subject: "Appointment Request Received",
    html: `
      <h2>Thank You for Your Request!</h2>
      <p>Hi ${data.customerName},</p>
      <p>We've received your appointment request and will review it shortly. Our team will contact you within 24-48 hours to confirm your appointment.</p>
      <p>If you have any questions in the meantime, please don't hesitate to reach out.</p>
      <p>— Addictive Pain Tattoo</p>
    `,
  }),
};

// Email transporter (configure with your SMTP settings)
let transporter: nodemailer.Transporter | null = null;

export function getEmailTransporter() {
  if (transporter) return transporter;

  // Configure based on environment variables
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("SMTP not configured. Emails will not be sent.");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return transporter;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  from?: string
): Promise<boolean> {
  const emailTransporter = getEmailTransporter();
  if (!emailTransporter) {
    console.warn("Email transporter not configured. Skipping email send.");
    return false;
  }

  try {
    await emailTransporter.sendMail({
      from: from || process.env.SMTP_FROM || "noreply@aptstudio.com",
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
