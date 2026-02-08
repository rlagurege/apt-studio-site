import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

// POST /api/payments/intent - Create payment intent for deposit
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { appointmentId, amountCents, description } = body;

    if (!appointmentId || !amountCents) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get the tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "apt-studios" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Get appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
      },
    });

    if (!appointment || appointment.tenantId !== tenant.id) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      description: description || `Deposit for appointment: ${appointment.title}`,
      metadata: {
        appointmentId,
        tenantId: tenant.id,
      },
    });

    // Create payment intent record in database
    const paymentIntentRecord = await prisma.paymentIntent.create({
      data: {
        tenantId: tenant.id,
        appointmentId,
        stripePaymentIntentId: paymentIntent.id,
        amountCents,
        currency: "usd",
        status: "requires_payment_method",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntentRecord.id,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
