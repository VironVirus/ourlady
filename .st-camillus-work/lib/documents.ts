import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import {
  readSiteContent,
  saveSiteContent,
  type DocumentItem
} from "@/lib/content";
import {
  documentsTable,
  getSupabaseAdmin
} from "@/lib/supabase-admin";
import { slugify } from "@/lib/slug";

type DocumentRecord = {
  id?: unknown;
  slug?: unknown;
  title?: unknown;
  category?: unknown;
  summary?: unknown;
  date_text?: unknown;
  file_url?: unknown;
  cover_image?: unknown;
  is_published?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

export type ParishDocument = DocumentItem & {
  createdAt?: string;
  updatedAt?: string;
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeDocument(
  input: Partial<ParishDocument>,
  fallbackId = `document-${Date.now()}`
): ParishDocument {
  const title = asString(input.title);

  return {
    id: asString(input.id) || fallbackId,
    slug: slugify(asString(input.slug) || title || fallbackId, fallbackId),
    title,
    category: asString(input.category) || "Bulletin",
    summary: asString(input.summary),
    date: asString(input.date),
    fileUrl: asString(input.fileUrl),
    coverImage: asString(input.coverImage),
    published: asBoolean(input.published, true),
    createdAt: asString(input.createdAt),
    updatedAt: asString(input.updatedAt)
  };
}

function fromSupabaseRecord(record: DocumentRecord, fallbackIndex = 0): ParishDocument {
  return normalizeDocument(
    {
      id: asString(record.id) || `document-${fallbackIndex + 1}`,
      slug: asString(record.slug),
      title: asString(record.title),
      category: asString(record.category),
      summary: asString(record.summary),
      date: asString(record.date_text),
      fileUrl: asString(record.file_url),
      coverImage: asString(record.cover_image),
      published: asBoolean(record.is_published, true),
      createdAt: asString(record.created_at),
      updatedAt: asString(record.updated_at)
    },
    `document-${fallbackIndex + 1}`
  );
}

function toSupabaseRecord(item: ParishDocument) {
  return {
    id: item.id || randomUUID(),
    slug: slugify(item.slug || item.title || item.id, item.id || "document"),
    title: item.title,
    category: item.category,
    summary: item.summary,
    date_text: item.date,
    file_url: item.fileUrl,
    cover_image: item.coverImage || null,
    is_published: item.published,
    updated_at: new Date().toISOString()
  };
}

function sortDocuments(items: ParishDocument[]) {
  return [...items].sort((left, right) => {
    const leftKey =
      Date.parse(left.updatedAt || left.createdAt || "") || 0;
    const rightKey =
      Date.parse(right.updatedAt || right.createdAt || "") || 0;

    return rightKey - leftKey;
  });
}

export async function readDocuments() {
  noStore();

  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(documentsTable)
        .select(
          "id, slug, title, category, summary, date_text, file_url, cover_image, is_published, created_at, updated_at"
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

  return sortDocuments(
    content.documents.map((item, index) =>
      normalizeDocument(item, item.id || `document-${index + 1}`)
    )
  );
}

export async function getPublishedDocuments() {
  const items = await readDocuments();

  return items.filter((item) => item.published && item.fileUrl);
}

export async function saveDocumentItem(input: Partial<ParishDocument>) {
  const normalized = normalizeDocument(input, asString(input.id) || randomUUID());
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const record = toSupabaseRecord(normalized);
    const { data, error } = await supabase
      .from(documentsTable)
      .upsert(record)
      .select(
        "id, slug, title, category, summary, date_text, file_url, cover_image, is_published, created_at, updated_at"
      )
      .single();

    if (error) {
      throw error;
    }

    return fromSupabaseRecord(data);
  }

  const content = await readSiteContent();
  const existingIndex = content.documents.findIndex((item) => item.id === normalized.id);
  const nextItems =
    existingIndex >= 0
      ? content.documents.map((item, index) =>
          index === existingIndex ? normalized : item
        )
      : [normalized, ...content.documents];

  await saveSiteContent({
    ...content,
    documents: nextItems
  });

  return normalized;
}

export async function deleteDocumentItem(id: string) {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { error } = await supabase.from(documentsTable).delete().eq("id", id);

    if (error) {
      throw error;
    }

    return;
  }

  const content = await readSiteContent();
  await saveSiteContent({
    ...content,
    documents: content.documents.filter((item) => item.id !== id)
  });
}
