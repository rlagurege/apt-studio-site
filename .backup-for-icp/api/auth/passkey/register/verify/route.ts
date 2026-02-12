import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { verifyRegistration } from "@/lib/webauthn";
import { authOptions } from "@/lib/auth";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userSlug = (session?.user as { artistSlug?: string } | undefined)?.artistSlug;

  if (!userSlug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const response = body.response as RegistrationResponseJSON;
    const expectedChallenge = body.challenge as string;

    if (!response || !expectedChallenge) {
      return NextResponse.json({ error: "Missing response or challenge" }, { status: 400 });
    }

    const result = await verifyRegistration(userSlug, response, expectedChallenge);

    if (result.verified) {
      return NextResponse.json({ verified: true, message: "Passkey registered successfully" });
    } else {
      return NextResponse.json({ verified: false, error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("[Passkey] Registration verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
