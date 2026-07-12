import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { saveHymnPlan, type HymnItem } from "@/lib/community-modules";
import { remoteStorageRequiredMessage } from "@/lib/deployment";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function sanitizeHymns(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const entry = item as Partial<HymnItem>;

    return {
      id: asString(entry.id) || `hymn-${index + 1}`,
      part: asString(entry.part),
      title: asString(entry.title),
      lyrics: asString(entry.lyrics)
    };
  });
}

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;

  if (!asString(body.title).trim()) {
    return NextResponse.json({ error: "Enter a hymn plan title." }, { status: 400 });
  }

  try {
    const saved = await saveHymnPlan({
      id: asString(body.id),
      date: asString(body.date),
      title: asString(body.title),
      note: asString(body.note),
      published: body.published !== false,
      hymns: sanitizeHymns(body.hymns)
    });

    ["/admin", "/admin/hymns", "/missal"].forEach((route) => revalidatePath(route));

    return NextResponse.json({ item: saved });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === remoteStorageRequiredMessage
            ? "Connect Supabase before saving hymn plans on Netlify."
            : "Unable to save this hymn plan right now."
      },
      { status: 500 }
    );
  }
}
