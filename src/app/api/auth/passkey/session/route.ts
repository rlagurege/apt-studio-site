import { NextResponse } from "next/server";
import { generatePasskeyToken } from "@/lib/passkey-tokens";

// This endpoint generates a passkey token for NextAuth sign-in
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = body.slug as string;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    // Generate a temporary token for NextAuth
    const token = generatePasskeyToken(slug);

    return NextResponse.json({
      token,
      slug,
    });
  } catch (error) {
    console.error("[Passkey Session] Error:", error);
    return NextResponse.json({ error: "Failed to create session token" }, { status: 500 });
  }
}
