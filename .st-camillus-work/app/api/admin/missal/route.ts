import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { saveMissalEntry, type MissalSection } from "@/lib/community-modules";
import { remoteStorageRequiredMessage } from "@/lib/deployment";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function sanitizeSections(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const entry = item as Partial<MissalSection>;

    return {
      id: asString(entry.id) || `section-${index + 1}`,
      heading: asString(entry.heading),
      body: asString(entry.body)
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
    return NextResponse.json({ error: "Enter a missal title." }, { status: 400 });
  }

  try {
    const saved = await saveMissalEntry({
      id: asString(body.id),
      title: asString(body.title),
      celebration: asString(body.celebration),
      date: asString(body.date),
      entryType: asString(body.entryType) === "order" ? "order" : "daily",
      language: asString(body.language) as never,
      published: body.published !== false,
      sections: sanitizeSections(body.sections)
    });

    ["/admin", "/admin/missal", "/missal"].forEach((route) => revalidatePath(route));

    return NextResponse.json({ item: saved });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === remoteStorageRequiredMessage
            ? "Connect Supabase before saving missal content on Netlify."
            : "Unable to save this missal entry right now."
      },
      { status: 500 }
    );
  }
}
