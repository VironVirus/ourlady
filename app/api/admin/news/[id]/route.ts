import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { remoteStorageRequiredMessage } from "@/lib/deployment";
import { deleteNewsPost } from "@/lib/news";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
  };

  try {
    await deleteNewsPost(id);

    ["/", "/news", "/admin", "/admin/news"].forEach((route) => revalidatePath(route));

    if (body.slug) {
      revalidatePath(`/news/${body.slug}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === remoteStorageRequiredMessage
            ? "Connect Supabase before removing news on Netlify."
            : "Unable to remove this story right now."
      },
      { status: 500 }
    );
  }
}
