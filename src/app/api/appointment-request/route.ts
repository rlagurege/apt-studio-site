import { NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { IncomingMessage } from "http";
import nodemailer from "nodemailer";
import { newId, safeFilename } from "@/lib/utils";
import { createAppointmentPageInNotion } from "@/lib/notion";
import {
  sanitizeInput,
  validateTextInput,
  isValidEmail,
  isValidPhone,
  sanitizeFilename,
  isValidImageExtension,
  isValidImageMimeType,
  isValidFileSize,
} from "@/lib/security";

export const runtime = "nodejs"; // required for formidable + fs

type Parsed = {
  fields: Record<string, string>;
  filePath?: string;
  originalFilename?: string;
};

function parseForm(req: Request): Promise<Parsed> {
  return new Promise((resolve, reject) => {
    const uploadsDir = path.join(process.cwd(), "uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const form = new IncomingForm({
      multiples: false,
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 8 * 1024 * 1024, // 8MB
      filter: ({ mimetype, originalFilename }) => {
        // Validate MIME type
        if (!mimetype || !isValidImageMimeType(mimetype)) {
          return false;
        }
        // Validate file extension
        if (originalFilename && !isValidImageExtension(originalFilename)) {
          return false;
        }
        return true;
      },
    });

    void (async () => {
      try {
        const buf = Buffer.from(await req.arrayBuffer());
        const stream = Readable.from(buf);

        const fakeReq = Object.assign(stream, {
          headers: Object.fromEntries(req.headers.entries()),
          method: req.method,
          url: "/api/appointment-request",
        }) as unknown as IncomingMessage;

        form.parse(fakeReq, (err, fields, files) => {
          if (err) return reject(err);

          const cleanFields: Record<string, string> = {};
          for (const [k, v] of Object.entries(fields)) {
            cleanFields[k] = Array.isArray(v) ? String(v[0] ?? "") : String(v ?? "");
          }

          const f = (files as { referenceImage?: { filepath?: string; originalFilename?: string } | Array<{ filepath?: string; originalFilename?: string }> })?.referenceImage;
          const fileObj = Array.isArray(f) ? f[0] : f;

          resolve({
            fields: cleanFields,
            filePath: fileObj?.filepath,
            originalFilename: fileObj?.originalFilename,
          });
        });
      } catch (e) {
        reject(e);
      }
    })();
  });
}

async function maybeEmailTami(opts: { subject: string; text: string }) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;
  const to = process.env.TAMMY_EMAIL; // Note: Keep TAMMY_EMAIL for backward compatibility

  if (!host || !port || !user || !pass || !from || !to) return;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject: opts.subject,
    text: opts.text,
  });
}

export async function POST(req: Request) {
  try {
    const { fields, filePath, originalFilename } = await parseForm(req);

    // Sanitize and validate inputs
    const artistSlug = sanitizeInput((fields.artistSlug || "").trim());
    const name = sanitizeInput((fields.name || "").trim());
    const contact = sanitizeInput((fields.contact || "").trim());
    const placement = sanitizeInput((fields.placement || "").trim());
    const size = sanitizeInput((fields.size || "").trim());
    const styleNotes = validateTextInput((fields.styleNotes || "").trim(), 5000);
    const budget = validateTextInput((fields.budget || "").trim(), 500) || undefined;
    const timeline = validateTextInput((fields.timeline || "").trim(), 500) || undefined;

    // Validate required fields
    if (!artistSlug || !name || !contact || !placement || !size || !styleNotes) {
      return new NextResponse("Missing required fields.", { status: 400 });
    }

    // Validate contact is email or phone
    const isEmail = isValidEmail(contact);
    const isPhone = isValidPhone(contact);
    if (!isEmail && !isPhone) {
      return new NextResponse("Invalid contact information. Please provide a valid email or phone number.", { status: 400 });
    }

    // Validate field lengths
    if (name.length > 100 || placement.length > 200 || size.length > 100) {
      return new NextResponse("One or more fields exceed maximum length.", { status: 400 });
    }

    const id = newId("app");
    const createdAtISO = new Date().toISOString();

    let savedPath: string | undefined;
    if (filePath && fs.existsSync(filePath)) {
      // Validate file size
      const stats = fs.statSync(filePath);
      if (!isValidFileSize(stats.size, 8)) {
        fs.unlinkSync(filePath); // Delete oversized file
        return new NextResponse("File size exceeds maximum allowed size (8MB).", { status: 400 });
      }

      // Validate and sanitize filename
      const safeOriginalFilename = originalFilename ? sanitizeFilename(originalFilename) : "image";
      const ext = path.extname(safeOriginalFilename) || ".jpg";
      
      // Ensure extension is valid
      if (!isValidImageExtension(ext)) {
        fs.unlinkSync(filePath); // Delete invalid file
        return new NextResponse("Invalid file type. Only images are allowed.", { status: 400 });
      }

      const finalName = safeFilename(`${id}${ext}`);
      const finalPath = path.join(process.cwd(), "uploads", finalName);
      
      // Ensure uploads directory exists
      const uploadsDir = path.dirname(finalPath);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      fs.renameSync(filePath, finalPath);
      savedPath = finalPath;
    }

    const inboxDir = path.join(process.cwd(), "data");
    fs.mkdirSync(inboxDir, { recursive: true });
    const inboxFile = path.join(inboxDir, "appointment_requests.jsonl");

    const record = {
      id,
      createdAtISO,
      artistSlug,
      name,
      contact,
      placement,
      size,
      styleNotes,
      budget: budget || undefined,
      timeline: timeline || undefined,
      referenceImageSavedPath: savedPath || undefined,
    };

    fs.appendFileSync(inboxFile, JSON.stringify(record) + "\n", "utf8");

    await createAppointmentPageInNotion(record);

    const subject = `APP Appointment Request — ${name} → ${artistSlug}`;
    const text =
      `New appointment request\n\n` +
      `Name: ${name}\n` +
      `Contact: ${contact}\n` +
      `Artist: ${artistSlug}\n` +
      `Placement: ${placement}\n` +
      `Size: ${size}\n` +
      `Budget: ${budget || "(not provided)"}\n` +
      `Timeline: ${timeline || "(not provided)"}\n\n` +
      `Details:\n${styleNotes}\n\n` +
      `Reference image saved: ${savedPath || "(none)"}\n` +
      `Request ID: ${id}\n` +
      `Created: ${createdAtISO}\n`;

    await maybeEmailTami({ subject, text });

    return NextResponse.json({ ok: true, id });
  } catch (err: unknown) {
    console.error(err);
    return new NextResponse("Server error.", { status: 500 });
  }
}
