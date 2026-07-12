import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { submitConfessionReservation } from "@/lib/community-modules";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;

  try {
    const result = await submitConfessionReservation(id, {
      fullName: asString(body.fullName),
      department: asString(body.department),
      level: asString(body.level),
      identifier: asString(body.identifier),
      timeSlot: asString(body.timeSlot),
      note: asString(body.note)
    });

    revalidatePath("/confession");
    revalidatePath("/admin/confession");

    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate,
      message: result.duplicate
        ? "Reservation already exists."
        : "Confession slot reserved successfully."
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to reserve confession right now."
      },
      { status: 400 }
    );
  }
}
