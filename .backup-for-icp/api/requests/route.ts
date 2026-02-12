import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";
import { newId, safeFilename } from "@/lib/utils";
import { createAppointmentPageInNotion } from "@/lib/notion";

export const runtime = "nodejs"; // required for formidable + fs

// Fallback function to create request in JSONL file (when database not available)
async function createRequestJSONL(data: {
  name: string;
  contact: string;
  artistSlug: string;
  placement: string;
  size: string;
  styleNotes: string;
  budget?: string;
  timeline?: string;
  fileData: { filePath?: string; originalFilename?: string };
}) {
  const { name, contact, artistSlug, placement, size, styleNotes, budget, timeline, fileData } = data;

  const id = newId("app");
  const createdAtISO = new Date().toISOString();

  // Handle file if present
  let savedPath: string | undefined;
  if (fileData.filePath && fs.existsSync(fileData.filePath)) {
    const ext = path.extname(fileData.originalFilename || fileData.filePath) || ".jpg";
    const finalName = safeFilename(`${id}${ext}`);
    const finalPath = path.join(process.cwd(), "uploads", finalName);
    
    const uploadsDir = path.dirname(finalPath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    fs.renameSync(fileData.filePath, finalPath);
    savedPath = finalPath;
  }

  // Write to JSONL file
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

  // Try to create Notion page (non-blocking)
  createAppointmentPageInNotion(record).catch((err) => {
    console.error("[Requests] Failed to create Notion page:", err);
  });

  return NextResponse.json({ 
    request: {
      id,
      createdAt: createdAtISO,
      artistSlug,
      name,
      contact,
      placement,
      size,
      styleNotes,
      budget,
      timeline,
    },
    message: "Request created successfully (using file system)",
  });
}

// GET /api/requests - Returns Tammi inbox list
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the tenant (assuming single tenant for now, or get from session)
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ requests: [] });
    }

    const requests = await prisma.appointmentRequest.findMany({
      where: {
        tenantId: tenant.id,
        deletedAt: null,
      },
      include: {
        customer: true,
        preferredArtist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

// POST /api/requests - Creates a new request from customer form
export async function POST(req: Request) {
  // Handle both JSON and FormData
  const contentType = req.headers.get("content-type") || "";
  let body: any = {};
  let fileData: { filePath?: string; originalFilename?: string } = {};
  
  try {

    if (contentType.includes("multipart/form-data")) {
      // Handle file uploads using the existing form parsing logic
      const { IncomingForm } = await import("formidable");
      const fs = await import("fs");
      const path = await import("path");
      const { Readable } = await import("stream");
      const { IncomingMessage } = await import("http");

      const uploadsDir = path.join(process.cwd(), "uploads");
      fs.mkdirSync(uploadsDir, { recursive: true });

      const form = new IncomingForm({
        multiples: false,
        uploadDir: uploadsDir,
        keepExtensions: true,
        maxFileSize: 8 * 1024 * 1024, // 8MB
        filter: ({ mimetype }) => {
          if (!mimetype) return true;
          return mimetype.startsWith("image/");
        },
      });

      const buf = Buffer.from(await req.arrayBuffer());
      const stream = Readable.from(buf);
      const fakeReq = Object.assign(stream, {
        headers: Object.fromEntries(req.headers.entries()),
        method: req.method,
        url: "/api/requests",
        }) as unknown as InstanceType<typeof IncomingMessage>;

      const parsed = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
        form.parse(fakeReq, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });

      const cleanFields: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed.fields)) {
        cleanFields[k] = Array.isArray(v) ? String(v[0] ?? "") : String(v ?? "");
      }

      const f = (parsed.files as { referenceImage?: { filepath?: string; originalFilename?: string } | Array<{ filepath?: string; originalFilename?: string }> })?.referenceImage;
      const fileObj = Array.isArray(f) ? f[0] : f;
      fileData = {
        filePath: fileObj?.filepath,
        originalFilename: fileObj?.originalFilename,
      };

      body = cleanFields;
    } else {
      body = await req.json();
    }

    const {
      name,
      contact,
      artistSlug,
      placement,
      size,
      styleNotes,
      budget,
      timeline,
    } = body;

    // Parse contact (email or phone)
    const isEmail = contact.includes("@");
    const email = isEmail ? contact : undefined;
    const phone = !isEmail ? contact : undefined;

    if (!name || !contact || !artistSlug || !placement || !size || !styleNotes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Try to use Prisma (database), fall back to JSONL file if database not configured
    let useDatabase = true;
    let tenant: any = null;
    let artist: any = null;

    try {
      // Get the tenant
      tenant = await prisma.tenant.findFirst({
        where: { slug: "apt-studios" },
      });

      if (!tenant) {
        console.warn("[Requests] Tenant not found in database, falling back to JSONL file");
        useDatabase = false;
      } else {
        // Find artist by slug
        artist = await prisma.user.findFirst({
          where: {
            tenantId: tenant.id,
            email: { contains: artistSlug },
          },
        });

        if (!artist) {
          console.warn(`[Requests] Artist ${artistSlug} not found in database, falling back to JSONL file`);
          useDatabase = false;
        }
      }
    } catch (dbError: any) {
      // Database not configured or error - fall back to JSONL file
      if (dbError?.message?.includes("not initialized") || dbError?.code === "P1001") {
        console.warn("[Requests] Database not configured, using JSONL file fallback");
        useDatabase = false;
      } else {
        throw dbError; // Re-throw unexpected errors
      }
    }

    // Fallback to JSONL file system if database not available
    if (!useDatabase) {
      return await createRequestJSONL({
        name,
        contact,
        artistSlug,
        placement,
        size,
        styleNotes,
        budget,
        timeline,
        fileData,
      });
    }

    // Handle file upload if present
    let fileRecord = null;
    if (fileData.filePath) {
      const fs = await import("fs");
      const path = await import("path");
      const { newId, safeFilename } = await import("@/lib/utils");

      if (fs.existsSync(fileData.filePath)) {
        const ext = path.extname(fileData.originalFilename || fileData.filePath) || ".jpg";
        const fileId = newId("file");
        const finalName = safeFilename(`${fileId}${ext}`);
        const finalPath = path.join(process.cwd(), "uploads", finalName);
        fs.renameSync(fileData.filePath, finalPath);

        fileRecord = await prisma.file.create({
          data: {
            tenantId: tenant.id,
            provider: "local",
            bucket: "uploads",
            key: finalName,
            url: `/uploads/${finalName}`,
            mimeType: "image/jpeg",
            sizeBytes: fs.statSync(finalPath).size,
          },
        });
      }
    }

    // Find or create customer
    let customer = null;
    if (email || phone) {
      // Try to find existing customer
      const existing = await prisma.customer.findFirst({
        where: {
          tenantId: tenant.id,
          ...(email ? { email } : phone ? { phone } : {}),
        },
      });

      if (existing) {
        customer = await prisma.customer.update({
          where: { id: existing.id },
          data: {
            name,
            ...(email ? { email } : {}),
            ...(phone ? { phone } : {}),
          },
        });
      } else {
        // Create new customer
        if (email) {
          // Find existing customer by email
          const existingCustomer = await prisma.customer.findFirst({
            where: {
              tenantId: tenant.id,
              email,
            },
          });
          
          if (existingCustomer) {
            customer = await prisma.customer.update({
              where: { id: existingCustomer.id },
              data: {
                name,
                phone: phone || undefined,
              },
            });
          } else {
            customer = await prisma.customer.create({
              data: {
                tenantId: tenant.id,
                name,
                email,
                phone: phone || undefined,
              },
            });
          }
        } else {
          // No email, create new customer
          customer = await prisma.customer.create({
            data: {
              tenantId: tenant.id,
              name,
              phone: phone || undefined,
            },
          });
        }
      }
    }

    // Parse budget if provided
    let budgetMinCents = undefined;
    let budgetMaxCents = undefined;
    if (budget) {
      // Try to parse budget range like "$500-$1000" or just "$500"
      const budgetMatch = budget.match(/\$?(\d+)(?:\s*-\s*\$?(\d+))?/);
      if (budgetMatch) {
        budgetMinCents = Math.round(parseFloat(budgetMatch[1]) * 100);
        if (budgetMatch[2]) {
          budgetMaxCents = Math.round(parseFloat(budgetMatch[2]) * 100);
        }
      }
    }

    // Create the request
    const request = await prisma.appointmentRequest.create({
      data: {
        tenantId: tenant.id,
        customerId: customer?.id,
        guestName: !customer ? name : undefined,
        guestEmail: !customer && email ? email : undefined,
        guestPhone: !customer && phone ? phone : undefined,
        preferredArtistId: artist.id,
        category: "custom",
        placement,
        sizeNotes: `${size}. ${styleNotes}`,
        description: styleNotes,
        budgetMinCents,
        budgetMaxCents,
        status: "requested",
        source: "website",
        priority: "normal",
      },
      include: {
        customer: true,
        preferredArtist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Link file to request if uploaded
    if (fileRecord) {
      await prisma.file.update({
        where: { id: fileRecord.id },
        data: { requestId: request.id },
      });
    }

    // Create audit event
    await prisma.requestEvent.create({
      data: {
        tenantId: tenant.id,
        requestId: request.id,
        type: "created",
        meta: {
          source: "website",
        },
      },
    });

    return NextResponse.json({ request });
  } catch (error: any) {
    console.error("Error creating request:", error);
    
    // Extract values for fallback
    const {
      name,
      contact,
      artistSlug,
      placement,
      size,
      styleNotes,
      budget,
      timeline,
    } = body;
    
    // If database error, try fallback to JSONL file
    if (error?.message?.includes("not initialized") || error?.code === "P1001" || error?.message?.includes("Tenant not found") || error?.message?.includes("Artist not found")) {
      console.log("[Requests] Database error detected, attempting JSONL fallback...");
      try {
        return await createRequestJSONL({
          name,
          contact,
          artistSlug,
          placement,
          size,
          styleNotes,
          budget,
          timeline,
          fileData,
        });
      } catch (fallbackError) {
        console.error("[Requests] Fallback also failed:", fallbackError);
        return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: error?.message || "Failed to create request",
      details: process.env.NODE_ENV === "development" ? String(error) : undefined,
    }, { status: 500 });
  }
}
