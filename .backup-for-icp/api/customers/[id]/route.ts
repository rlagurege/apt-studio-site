import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/customers/[id] - Get customer details with history
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        requests: {
          where: { deletedAt: null },
          include: {
            preferredArtist: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        appts: {
          where: { deletedAt: null },
          include: {
            artist: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            startAt: "desc",
          },
        },
      },
    });

    if (!customer || customer.tenantId !== tenant.id) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      customer,
      requests: customer.requests,
      appointments: customer.appts,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}

// PATCH /api/customers/[id] - Update customer notes
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { notes } = body;

    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: { notes: notes || null },
    });

    if (customer.tenantId !== tenant.id) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}
