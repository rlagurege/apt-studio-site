import { NextResponse } from "next/server";
import { verifyAuthentication } from "@/lib/webauthn";
import type { AuthenticationResponseJSON } from "@simplewebauthn/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = body.slug as string;
    const response = body.response as AuthenticationResponseJSON;
    const expectedChallenge = body.challenge as string;

    if (!slug || !response || !expectedChallenge) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await verifyAuthentication(slug, response, expectedChallenge);

    if (!result.verified) {
      return NextResponse.json({ verified: false, error: result.error }, { status: 401 });
    }

    // On successful passkey auth, create a session via NextAuth
    // We'll use a special "passkey" provider or extend credentials
    // For now, return success and let client handle session creation
    return NextResponse.json({ 
      verified: true, 
      slug,
      message: "Passkey authentication successful. Please sign in with your password to complete setup." 
    });
  } catch (error) {
    console.error("[Passkey] Login verify error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
