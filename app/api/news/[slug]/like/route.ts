import { NextResponse } from "next/server";
import { likeNewsPost } from "@/lib/news";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const likes = await likeNewsPost(slug);

    return NextResponse.json({ likes });
  } catch {
    return NextResponse.json({ error: "Unable to update the like right now." }, { status: 400 });
  }
}
