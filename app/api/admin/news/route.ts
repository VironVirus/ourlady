import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { remoteStorageRequiredMessage } from "@/lib/deployment";
import { saveNewsPost } from "@/lib/news";

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
    return NextResponse.json({ error: "Enter a news title." }, { status: 400 });
  }

  try {
    const saved = await saveNewsPost({
      id: asString(body.id),
      slug: asString(body.slug),
      label: asString(body.label),
      title: asString(body.title),
      description: asString(body.excerpt),
      excerpt: asString(body.excerpt),
      content: asString(body.content),
      date: asString(body.date),
      location: asString(body.location),
      image: asString(body.image),
      published: body.published !== false,
      likes: typeof body.likes === "number" ? body.likes : 0
    });

    [
      "/",
      "/news",
      `/news/${saved.slug}`,
      "/admin",
      "/admin/news"
    ].forEach((route) => revalidatePath(route));

    const previousSlug = asString(body.previousSlug);
    if (previousSlug && previousSlug !== saved.slug) {
      revalidatePath(`/news/${previousSlug}`);
    }

    return NextResponse.json({
      item: saved,
      storyUrl: `/news/${saved.slug}`
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === remoteStorageRequiredMessage
            ? "Connect Supabase before saving news on Netlify."
            : "Unable to save this story right now."
      },
      { status: 500 }
    );
  }
}
