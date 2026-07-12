import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteAttendanceRequest } from "@/lib/community-modules";
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
    await deleteAttendanceRequest(id);
    ["/admin", "/admin/attendance"].forEach((route) => revalidatePath(route));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === remoteStorageRequiredMessage
            ? "Connect Supabase before removing attendance on Netlify."
            : "Unable to remove this attendance request right now."
      },
      { status: 500 }
    );
  }
}
