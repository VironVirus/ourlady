import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteHymnPlan } from "@/lib/community-modules";
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
    await deleteHymnPlan(id);
    ["/admin", "/admin/hymns", "/missal"].forEach((route) => revalidatePath(route));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === remoteStorageRequiredMessage
            ? "Connect Supabase before removing hymn plans on Netlify."
            : "Unable to remove this hymn plan right now."
      },
      { status: 500 }
    );
  }
}
