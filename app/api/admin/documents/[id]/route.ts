import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/cache";
import { remoteStorageRequiredMessage } from "@/lib/deployment";
import { deleteDocumentItem } from "@/lib/documents";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteDocumentItem(id);
    revalidateTag(CACHE_TAGS.documents, "max");
    revalidateTag(CACHE_TAGS.siteContent, "max");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === remoteStorageRequiredMessage
            ? "Connect Supabase before removing documents on Netlify."
            : "Unable to remove this document right now."
      },
      { status: 500 }
    );
  }
}
