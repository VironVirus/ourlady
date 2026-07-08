import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { churchMediaBucket, getSupabaseAdmin } from "@/lib/supabase-admin";

function sanitizeFolderName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9/-]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^-+|-+$/g, "") || "uploads";
}

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured yet. Add the Supabase environment values before uploading images."
      },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = sanitizeFolderName(String(formData.get("folder") ?? "news"));
  const kind = String(formData.get("kind") ?? "image");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a file first." }, { status: 400 });
  }

  if (kind === "image") {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Use an image smaller than 2MB." },
        { status: 400 }
      );
    }
  } else {
    const allowedDocumentTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]);

    if (!allowedDocumentTypes.has(file.type)) {
      return NextResponse.json(
        { error: "Upload a PDF or Word document." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Use a document smaller than 10MB." },
        { status: 400 }
      );
    }
  }

  const extension =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const filePath = `${folder}/${Date.now()}-${randomUUID()}.${extension}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(churchMediaBucket).upload(filePath, fileBuffer, {
    contentType: file.type,
    upsert: false
  });

  if (error) {
    return NextResponse.json(
      { error: "Upload failed. Check the Supabase bucket setup." },
      { status: 500 }
    );
  }

  const { data } = supabase.storage.from(churchMediaBucket).getPublicUrl(filePath);

  return NextResponse.json({
    path: filePath,
    url: data.publicUrl
  });
}
