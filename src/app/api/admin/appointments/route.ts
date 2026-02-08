import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { authOptions } from "@/lib/auth";

type AppointmentRow = {
  id: string;
  createdAtISO: string;
  artistSlug: string;
  name: string;
  contact: string;
  placement: string;
  size: string;
  styleNotes: string;
  budget?: string;
  timeline?: string;
  referenceImageSavedPath?: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inboxFile = path.join(process.cwd(), "data", "appointment_requests.jsonl");
  if (!fs.existsSync(inboxFile)) {
    return NextResponse.json({ appointments: [] });
  }

  const raw = fs.readFileSync(inboxFile, "utf8");
  const lines = raw.trim().split("\n").filter(Boolean);
  const all: AppointmentRow[] = [];
  for (const line of lines) {
    try {
      const row = JSON.parse(line) as AppointmentRow;
      all.push(row);
    } catch {
      // skip invalid lines
    }
  }

  // Newest first
  all.sort((a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime());

  return NextResponse.json({
    appointments: all,
  });
}
