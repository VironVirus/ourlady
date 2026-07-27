import { randomUUID } from "crypto";
import { unstable_cache } from "next/cache";
import {
  readSiteContent,
  saveSiteContent,
  type NewsItem
} from "@/lib/content";
import { CACHE_TAGS, PUBLIC_PAGE_REVALIDATE_SECONDS } from "@/lib/cache";
import {
  getSupabaseAdmin,
  newsPostsTable
} from "@/lib/supabase-admin";
import {
  collectNewsImages,
  encodeNewsImages,
  getPrimaryNewsImage
} from "@/lib/news-images";
import { normalizeNewsCategory } from "@/lib/news-categories";
import { slugify } from "@/lib/slug";

type NewsRecord = {
  id?: unknown;
  slug?: unknown;
  label?: unknown;
  title?: unknown;
  excerpt?: unknown;
  content?: unknown;
  date_text?: unknown;
  location?: unknown;
  image_url?: unknown;
  is_published?: unknown;
  like_count?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

export type NewsPost = NewsItem & {
  createdAt?: string;
  updatedAt?: string;
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeNewsPost(
  input: Partial<NewsPost>,
  fallbackId = `news-${Date.now()}`
): NewsPost {
  const title = asString(input.title);
  const excerpt = asString(input.excerpt) || asString(input.description);
  const content = asString(input.content) || excerpt;
  const images = collectNewsImages(input.images, input.image);

  return {
    id: asString(input.id) || fallbackId,
    slug: slugify(asString(input.slug) || title || fallbackId, fallbackId),
    label: normalizeNewsCategory(asString(input.label) || "General"),
    title,
    description: asString(input.description) || excerpt,
    excerpt,
    content,
    date: asString(input.date),
    location: asString(input.location),
    image: getPrimaryNewsImage({ image: input.image, images }),
    images,
    comments: asNumber((input as { comments?: unknown }).comments),
    published: asBoolean(input.published, true),
    likes: asNumber(input.likes),
    createdAt: asString(input.createdAt),
    updatedAt: asString(input.updatedAt)
  };
}

function fromSupabaseRecord(record: NewsRecord, fallbackIndex = 0): NewsPost {
  return normalizeNewsPost(
    {
      id: asString(record.id) || `news-${fallbackIndex + 1}`,
      slug: asString(record.slug),
      label: asString(record.label),
      title: asString(record.title),
      excerpt: asString(record.excerpt),
      content: asString(record.content),
      date: asString(record.date_text),
      location: asString(record.location),
      image: asString(record.image_url),
      comments: 0,
      published: asBoolean(record.is_published, true),
      likes: asNumber(record.like_count),
      createdAt: asString(record.created_at),
      updatedAt: asString(record.updated_at)
    },
    `news-${fallbackIndex + 1}`
  );
}

function toSupabaseRecord(post: NewsPost) {
  const images = collectNewsImages(post.images, post.image);

  return {
    id: post.id || randomUUID(),
    slug: slugify(post.slug || post.title || post.id, post.id || "news"),
    label: normalizeNewsCategory(post.label),
    title: post.title,
    excerpt: post.excerpt || post.description,
    content: post.content || post.excerpt || post.description,
    date_text: post.date,
    location: post.location,
    image_url: encodeNewsImages(images),
    is_published: post.published,
    like_count: post.likes,
    updated_at: new Date().toISOString()
  };
}

function sortNewsPosts(items: NewsPost[]) {
  return [...items].sort((left, right) => {
    const leftKey =
      Date.parse(left.updatedAt || left.createdAt || "") || 0;
    const rightKey =
      Date.parse(right.updatedAt || right.createdAt || "") || 0;

    return rightKey - leftKey;
  });
}

export async function readNewsPosts() {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(newsPostsTable)
        .select(
          "id, slug, label, title, excerpt, content, date_text, location, image_url, is_published, like_count, created_at, updated_at"
        )
        .order("updated_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item, index) => fromSupabaseRecord(item, index));
      }
    } catch {
      // Fall back to local content when the table or credentials are unavailable.
    }
  }

  const content = await readSiteContent();

  return sortNewsPosts(
    content.newsItems.map((item, index) =>
      normalizeNewsPost(item, item.id || `news-${index + 1}`)
    )
  );
}

const getCachedNewsPosts = unstable_cache(readNewsPosts, [CACHE_TAGS.news], {
  tags: [CACHE_TAGS.news, CACHE_TAGS.siteContent],
  revalidate: PUBLIC_PAGE_REVALIDATE_SECONDS
});

export async function getPublishedNewsPosts() {
  const items = await getCachedNewsPosts();

  return items.filter((item) => item.published);
}

export async function getNewsPostBySlug(slug: string) {
  const posts = await getCachedNewsPosts();

  return posts.find((item) => item.slug === slug) ?? null;
}

export async function saveNewsPost(input: Partial<NewsPost>) {
  const normalized = normalizeNewsPost(input, asString(input.id) || randomUUID());
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const record = toSupabaseRecord(normalized);
    const { data, error } = await supabase
      .from(newsPostsTable)
      .upsert(record)
      .select(
        "id, slug, label, title, excerpt, content, date_text, location, image_url, is_published, like_count, created_at, updated_at"
      )
      .single();

    if (error) {
      throw error;
    }

    return fromSupabaseRecord(data);
  }

  const content = await readSiteContent();
  const existingIndex = content.newsItems.findIndex((item) => item.id === normalized.id);
  const nextItems =
    existingIndex >= 0
      ? content.newsItems.map((item, index) =>
          index === existingIndex ? normalized : item
        )
      : [normalized, ...content.newsItems];

  await saveSiteContent({
    ...content,
    newsItems: nextItems
  });

  return normalized;
}

export async function deleteNewsPost(id: string) {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { error } = await supabase.from(newsPostsTable).delete().eq("id", id);

    if (error) {
      throw error;
    }

    return;
  }

  const content = await readSiteContent();
  await saveSiteContent({
    ...content,
    newsItems: content.newsItems.filter((item) => item.id !== id)
  });
}

export async function likeNewsPost(slug: string) {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from(newsPostsTable)
      .select("id, like_count")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data?.id) {
      throw error ?? new Error("Story not found.");
    }

    const nextLikes = asNumber(data.like_count) + 1;
    const { error: updateError } = await supabase
      .from(newsPostsTable)
      .update({
        like_count: nextLikes,
        updated_at: new Date().toISOString()
      })
      .eq("id", data.id);

    if (updateError) {
      throw updateError;
    }

    return nextLikes;
  }

  const content = await readSiteContent();
  const target = content.newsItems.find((item) => item.slug === slug);

  if (!target) {
    throw new Error("Story not found.");
  }

  const nextLikes = target.likes + 1;
  await saveSiteContent({
    ...content,
    newsItems: content.newsItems.map((item) =>
      item.slug === slug
        ? {
            ...item,
            likes: nextLikes
          }
        : item
    )
  });

  return nextLikes;
}
