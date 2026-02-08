import { NextResponse } from "next/server";
import { generateAuthenticationOptionsForUser } from "@/lib/webauthn";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = body.slug as string;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const options = await generateAuthenticationOptionsForUser(slug);

    return NextResponse.json(options);
  } catch (error) {
    console.error("[Passkey] Login options error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
