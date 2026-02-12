import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { generateRegistrationOptionsForUser } from "@/lib/webauthn";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userSlug = (session?.user as { artistSlug?: string } | undefined)?.artistSlug;

  if (!userSlug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const userName = body.userName || userSlug;

    const options = await generateRegistrationOptionsForUser(userSlug, userName);

    return NextResponse.json(options);
  } catch (error) {
    console.error("[Passkey] Registration options error:", error);
    return NextResponse.json({ error: "Failed to generate options" }, { status: 500 });
  }
}
