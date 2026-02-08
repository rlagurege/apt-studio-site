import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { readFileSync, existsSync } from "fs";
import {
  sanitizeInput,
  validateTextInput,
  sanitizeFilename,
  isValidImageExtension,
  isValidImageMimeType,
  isValidFileSize,
  isValidSlug,
} from "@/lib/security";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const artistSlug = (session?.user as { artistSlug?: string } | undefined)?.artistSlug;

  if (!artistSlug || !isValidSlug(artistSlug)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const beforeFile = formData.get("before") as File | null;
    const afterFile = formData.get("after") as File | null;
    const title = sanitizeInput((formData.get("title") as string | null) || "");
    const styles = sanitizeInput((formData.get("styles") as string | null) || "");

    // Allow upload with just one photo (before or after)
    if (!beforeFile && !afterFile) {
      return NextResponse.json({ error: "At least one photo is required" }, { status: 400 });
    }

    // Use afterFile as primary, or beforeFile if no afterFile
    const primaryFile = afterFile || beforeFile;
    if (!primaryFile) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type and size
    if (!isValidImageMimeType(primaryFile.type)) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }

    if (!isValidFileSize(primaryFile.size, 10)) {
      return NextResponse.json({ error: "File size exceeds maximum allowed size (10MB)." }, { status: 400 });
    }

    // Validate filename
    if (beforeFile && !isValidImageExtension(beforeFile.name)) {
      return NextResponse.json({ error: "Invalid file extension for before image." }, { status: 400 });
    }
    if (afterFile && !isValidImageExtension(afterFile.name)) {
      return NextResponse.json({ error: "Invalid file extension for after image." }, { status: 400 });
    }

    // Create uploads directory
    const uploadsDir = join(process.cwd(), "public", "tattoos", artistSlug);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    let afterUrl: string | undefined;
    let beforeUrl: string | undefined;

    // Save after photo if provided
    if (afterFile) {
      const sanitizedFilename = sanitizeFilename(afterFile.name);
      const fileExt = path.extname(sanitizedFilename) || ".jpg";
      
      // Ensure extension is valid
      if (!isValidImageExtension(fileExt)) {
        return NextResponse.json({ error: "Invalid file extension." }, { status: 400 });
      }

      const afterFilename = `${timestamp}-after${fileExt}`;
      const afterPath = join(uploadsDir, afterFilename);
      afterUrl = `/tattoos/${artistSlug}/${afterFilename}`;

      const afterBytes = await afterFile.arrayBuffer();
      await writeFile(afterPath, Buffer.from(afterBytes));
    }

    // Save before photo if provided
    if (beforeFile) {
      const sanitizedFilename = sanitizeFilename(beforeFile.name);
      const beforeExt = path.extname(sanitizedFilename) || ".jpg";
      
      // Ensure extension is valid
      if (!isValidImageExtension(beforeExt)) {
        return NextResponse.json({ error: "Invalid file extension." }, { status: 400 });
      }

      const beforeFilename = `${timestamp}-before${beforeExt}`;
      const beforePath = join(uploadsDir, beforeFilename);
      beforeUrl = `/tattoos/${artistSlug}/${beforeFilename}`;

      const beforeBytes = await beforeFile.arrayBuffer();
      await writeFile(beforePath, Buffer.from(beforeBytes));
    }

    // Use afterUrl as primary imageUrl, or beforeUrl if no after
    const imageUrl = afterUrl || beforeUrl || "";

    // Add to tattoos content
    const tattoosFile = join(process.cwd(), "src", "content", "tattoos.ts");
    const tattoosContent = readFileSync(tattoosFile, "utf8");

    // Validate and sanitize title
    const sanitizedTitle = title && title.length > 0 ? validateTextInput(title, 200) : null;
    if (!sanitizedTitle) {
      return NextResponse.json({ error: "Invalid title. Title is required and must be less than 200 characters." }, { status: 400 });
    }

    // Validate styles
    const styleArray = styles
      ? styles
          .split(",")
          .map((s) => sanitizeInput(s.trim()))
          .filter((s) => s.length > 0 && s.length <= 50)
      : ["custom"];

    const newTattoo = {
      id: `t${Date.now()}`,
      artistSlug,
      title: sanitizedTitle,
      imageUrl,
      beforeImageUrl: beforeUrl,
      styles: styleArray.length > 0 ? styleArray : ["custom"],
    };

    // Find the closing bracket and insert before it
    const insertPoint = tattoosContent.lastIndexOf("];");
    const stylesArray = newTattoo.styles.map((s) => `"${s}"`).join(", ");
    const beforeImageLine = newTattoo.beforeImageUrl
      ? `    beforeImageUrl: "${newTattoo.beforeImageUrl}",\n`
      : "";
    const newEntry = `  {
    id: "${newTattoo.id}",
    artistSlug: "${newTattoo.artistSlug}",
    title: "${newTattoo.title}",
    imageUrl: "${newTattoo.imageUrl}",
${beforeImageLine}    styles: [${stylesArray}],
  },
`;

    const updatedContent =
      tattoosContent.slice(0, insertPoint) + newEntry + tattoosContent.slice(insertPoint);

    await writeFile(tattoosFile, updatedContent, "utf8");

    return NextResponse.json({
      success: true,
      tattoo: newTattoo,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
