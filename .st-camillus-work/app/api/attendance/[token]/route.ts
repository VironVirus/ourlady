import { NextResponse } from "next/server";
import { submitAttendanceByToken } from "@/lib/community-modules";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = (await request.json()) as Record<string, unknown>;

  try {
    const result = await submitAttendanceByToken(token, {
      fullName: asString(body.fullName),
      department: asString(body.department),
      level: asString(body.level),
      identifier: asString(body.identifier)
    });

    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate,
      message: result.duplicate
        ? "Attendance already recorded."
        : "Attendance recorded successfully."
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to record attendance right now."
      },
      { status: 400 }
    );
  }
}
