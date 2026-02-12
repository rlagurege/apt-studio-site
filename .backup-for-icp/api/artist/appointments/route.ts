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
  const artistSlug = (session?.user as { artistSlug?: string } | undefined)?.artistSlug;

  if (!artistSlug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inboxFile = path.join(process.cwd(), "data", "appointment_requests.jsonl");
  if (!fs.existsSync(inboxFile)) {
    return NextResponse.json({ appointments: [], notifications: [] });
  }

  const raw = fs.readFileSync(inboxFile, "utf8");
  const lines = raw.trim().split("\n").filter(Boolean);
  const all: AppointmentRow[] = [];
  for (const line of lines) {
    try {
      const row = JSON.parse(line) as AppointmentRow;
      if (row.artistSlug === artistSlug) all.push(row);
    } catch {
      // skip invalid lines
    }
  }

  // Newest first
  all.sort((a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime());

  const today = new Date().toISOString().slice(0, 10);
  const notifications = all.map((a) => ({
    id: a.id,
    type: "new_request" as const,
    message: `New request from ${a.name}`,
    createdAtISO: a.createdAtISO,
    isToday: a.createdAtISO.startsWith(today),
  }));

  return NextResponse.json({
    appointments: all,
    notifications,
  });
}
