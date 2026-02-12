import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month";

    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Get all completed appointments
    const completedAppointments = await prisma.appointment.findMany({
      where: {
        tenantId: tenant.id,
        status: "completed",
        deletedAt: null,
      },
      include: {
        service: true,
        request: {
          include: {
            paymentIntents: true,
          },
        },
      },
    });

    // Calculate total revenue (from completed appointments)
    // For now, we'll estimate based on service default pricing or use a placeholder
    // In a real system, you'd track actual payment amounts
    const totalRevenue = completedAppointments.reduce((sum, apt) => {
      // Estimate: if service has deposit, assume full amount is 3x deposit
      // Otherwise, use a default of $200
      if (apt.service?.depositAmountCents) {
        return sum + apt.service.depositAmountCents * 3;
      }
      return sum + 20000; // $200 default
    }, 0);

    // Get all payment intents (deposits)
    const paymentIntents = await prisma.paymentIntent.findMany({
      where: {
        tenantId: tenant.id,
      },
    });

    const totalDeposits = paymentIntents
      .filter((pi) => pi.status === "paid")
      .reduce((sum, pi) => sum + (pi.amountCents || 0), 0);

    const pendingDeposits = paymentIntents.filter((pi) => pi.status === "requires_payment" || pi.status === "processing").length;

    // This month stats
    const thisMonthAppointments = completedAppointments.filter(
      (apt) => apt.startAt >= thisMonthStart && apt.startAt <= thisMonthEnd
    );

    const thisMonthRevenue = thisMonthAppointments.reduce((sum, apt) => {
      if (apt.service?.depositAmountCents) {
        return sum + apt.service.depositAmountCents * 3;
      }
      return sum + 20000;
    }, 0);

    const thisMonthDeposits = paymentIntents
      .filter(
        (pi) =>
          pi.status === "paid" &&
          pi.createdAt >= thisMonthStart &&
          pi.createdAt <= thisMonthEnd
      )
      .reduce((sum, pi) => sum + (pi.amountCents || 0), 0);

    // Last month stats
    const lastMonthAppointments = completedAppointments.filter(
      (apt) => apt.startAt >= lastMonthStart && apt.startAt <= lastMonthEnd
    );

    const lastMonthRevenue = lastMonthAppointments.reduce((sum, apt) => {
      if (apt.service?.depositAmountCents) {
        return sum + apt.service.depositAmountCents * 3;
      }
      return sum + 20000;
    }, 0);

    const lastMonthDeposits = paymentIntents
      .filter(
        (pi) =>
          pi.status === "paid" &&
          pi.createdAt >= lastMonthStart &&
          pi.createdAt <= lastMonthEnd
      )
      .reduce((sum, pi) => sum + (pi.amountCents || 0), 0);

    return NextResponse.json({
      totalRevenue,
      totalDeposits,
      completedAppointments: completedAppointments.length,
      pendingDeposits,
      thisMonth: {
        revenue: thisMonthRevenue,
        deposits: thisMonthDeposits,
        appointments: thisMonthAppointments.length,
      },
      lastMonth: {
        revenue: lastMonthRevenue,
        deposits: lastMonthDeposits,
        appointments: lastMonthAppointments.length,
      },
    });
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    return NextResponse.json({ error: "Failed to fetch revenue stats" }, { status: 500 });
  }
}
