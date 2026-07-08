import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { remoteStorageRequiredMessage } from "@/lib/deployment";
import { saveDocumentItem } from "@/lib/documents";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;

  if (!asString(body.title).trim()) {
    return NextResponse.json({ error: "Enter a document title." }, { status: 400 });
  }

  if (!asString(body.fileUrl).trim()) {
    return NextResponse.json({ error: "Upload or paste the document file link." }, { status: 400 });
  }

  try {
    const saved = await saveDocumentItem({
      id: asString(body.id),
      slug: asString(body.slug),
      title: asString(body.title),
      category: asString(body.category),
      summary: asString(body.summary),
      date: asString(body.date),
      fileUrl: asString(body.fileUrl),
      coverImage: asString(body.coverImage),
      published: body.published !== false
    });

    ["/documents", "/admin", "/admin/documents"].forEach((route) => revalidatePath(route));

    return NextResponse.json({
      item: saved,
      publicUrl: "/documents"
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === remoteStorageRequiredMessage
            ? "Connect Supabase before saving documents on Netlify."
            : "Unable to save this document right now."
      },
      { status: 500 }
    );
  }
}
