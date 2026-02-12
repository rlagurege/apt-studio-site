import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/users - Returns users (artists) for dropdowns
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    // Get the tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ users: [] });
    }

    let where: any = {
      tenantId: tenant.id,
      status: "active",
    };

    // If role filter is provided, filter by role
    if (role) {
      const roleRecord = await prisma.role.findFirst({
        where: {
          tenantId: tenant.id,
          name: { equals: role, mode: "insensitive" },
        },
      });

      if (roleRecord) {
        const userIds = await prisma.userRole.findMany({
          where: {
            tenantId: tenant.id,
            roleId: roleRecord.id,
          },
          select: { userId: true },
        });

        where.id = { in: userIds.map((ur) => ur.userId) };
      }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
