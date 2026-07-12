import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteMissalEntry } from "@/lib/community-modules";
import { remoteStorageRequiredMessage } from "@/lib/deployment";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteMissalEntry(id);
    ["/admin", "/admin/missal", "/missal"].forEach((route) => revalidatePath(route));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === remoteStorageRequiredMessage
            ? "Connect Supabase before removing missal content on Netlify."
            : "Unable to remove this missal entry right now."
      },
      { status: 500 }
    );
  }
}
