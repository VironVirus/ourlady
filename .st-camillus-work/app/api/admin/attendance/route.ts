import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { saveAttendanceRequest } from "@/lib/community-modules";
import { remoteStorageRequiredMessage } from "@/lib/deployment";

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
    return NextResponse.json({ error: "Enter an attendance title." }, { status: 400 });
  }

  try {
    const saved = await saveAttendanceRequest({
      id: asString(body.id),
      title: asString(body.title),
      date: asString(body.date),
      location: asString(body.location),
      note: asString(body.note),
      opensAt: asString(body.opensAt),
      closesAt: asString(body.closesAt),
      token: asString(body.token),
      published: body.published !== false
    });

    ["/admin", "/admin/attendance", `/attendance/check-in/${saved.token}`].forEach((route) =>
      revalidatePath(route)
    );

    return NextResponse.json({ item: saved });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === remoteStorageRequiredMessage
            ? "Connect Supabase before saving attendance on Netlify."
            : "Unable to save this attendance request right now."
      },
      { status: 500 }
    );
  }
}
