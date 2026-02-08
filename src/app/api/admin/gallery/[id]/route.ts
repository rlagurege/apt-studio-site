import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { unlink } from "fs/promises";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const tattoosFile = join(process.cwd(), "src", "content", "tattoos.ts");
    const content = readFileSync(tattoosFile, "utf8");

    // Find the tattoo entry
    const tattooMatch = content.match(
      new RegExp(`\\{[^}]*id:\\s*"${id}"[^}]*\\}`, "s")
    );

    if (!tattooMatch) {
      return NextResponse.json({ error: "Tattoo not found" }, { status: 404 });
    }

    // Extract imageUrl and beforeImageUrl
    const imageUrlMatch = tattooMatch[0].match(/imageUrl:\s*"([^"]+)"/);
    const beforeImageUrlMatch = tattooMatch[0].match(/beforeImageUrl:\s*"([^"]+)"/);

    // Delete image files
    if (imageUrlMatch) {
      const imagePath = join(process.cwd(), "public", imageUrlMatch[1]);
      try {
        await unlink(imagePath);
      } catch (err) {
        console.warn(`Could not delete image: ${imagePath}`);
      }
    }

    if (beforeImageUrlMatch) {
      const beforePath = join(process.cwd(), "public", beforeImageUrlMatch[1]);
      try {
        await unlink(beforePath);
      } catch (err) {
        console.warn(`Could not delete before image: ${beforePath}`);
      }
    }

    // Remove from tattoos.ts - find the entry block
    const lines = content.split("\n");
    let startLine = -1;
    let endLine = -1;
    let braceCount = 0;
    let foundStart = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes(`id: "${id}"`)) {
        // Found the entry, work backwards to find the opening brace
        for (let j = i; j >= 0; j--) {
          if (lines[j].trim().startsWith("{")) {
            startLine = j;
            foundStart = true;
            braceCount = 1;
            break;
          }
        }
        if (!foundStart) {
          startLine = i;
          braceCount = 1;
        }
      }
      
      if (foundStart || startLine !== -1) {
        // Count braces to find the closing brace
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        braceCount += openBraces - closeBraces;
        
        if (braceCount === 0 && startLine !== -1) {
          endLine = i;
          break;
        }
      }
    }

    if (startLine !== -1 && endLine !== -1) {
      // Remove the entry block
      const before = lines.slice(0, startLine);
      const after = lines.slice(endLine + 1);
      
      // Remove trailing comma from the line before if needed
      if (before.length > 0) {
        const lastBefore = before[before.length - 1];
        if (lastBefore.trim().endsWith(",")) {
          before[before.length - 1] = lastBefore.replace(/,\s*$/, "");
        }
      }
      
      const newContent = [...before, ...after].join("\n");
      writeFileSync(tattoosFile, newContent, "utf8");
    } else {
      return NextResponse.json({ error: "Could not find entry in file" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("[Gallery Delete] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete" },
      { status: 500 }
    );
  }
}
