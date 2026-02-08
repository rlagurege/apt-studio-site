import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs"; // required for formidable + fs

// GET /api/requests - Returns Tammy inbox list
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
  try {
    // Handle both JSON and FormData
    const contentType = req.headers.get("content-type") || "";
    let body: any = {};
    let fileData: { filePath?: string; originalFilename?: string } = {};

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
      }) as unknown as IncomingMessage;

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

    // Get the tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Find artist by slug
    const artist = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        email: { contains: artistSlug },
      },
    });

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
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
          customer = await prisma.customer.upsert({
            where: {
              tenantId_email: {
                tenantId: tenant.id,
                email,
              },
            },
            update: {
              name,
              phone: phone || undefined,
            },
            create: {
              tenantId: tenant.id,
              name,
              email,
              phone: phone || undefined,
            },
          });
        } else {
          // Phone only - just create
          customer = await prisma.customer.create({
            data: {
              tenantId: tenant.id,
              name,
              phone,
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
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}
