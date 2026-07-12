import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { saveConfessionSchedule } from "@/lib/community-modules";
import { remoteStorageRequiredMessage } from "@/lib/deployment";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;

  if (!asString(body.title).trim()) {
    return NextResponse.json({ error: "Enter a confession title." }, { status: 400 });
  }

  try {
    const saved = await saveConfessionSchedule({
      id: asString(body.id),
      title: asString(body.title),
      date: asString(body.date),
      location: asString(body.location),
      note: asString(body.note),
      startTime: asString(body.startTime),
      endTime: asString(body.endTime),
      slotMinutes: asNumber(body.slotMinutes, 10),
      maxPerSlot: asNumber(body.maxPerSlot, 1),
      published: body.published !== false
    });

    ["/admin", "/admin/confession", "/confession"].forEach((route) => revalidatePath(route));

    return NextResponse.json({ item: saved });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === remoteStorageRequiredMessage
            ? "Connect Supabase before saving confession schedules on Netlify."
            : "Unable to save this confession schedule right now."
      },
      { status: 500 }
    );
  }
}
