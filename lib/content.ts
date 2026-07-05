import { promises as fs } from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import {
  getSupabaseAdmin,
  siteContentRowId,
  siteContentTable
} from "@/lib/supabase-admin";
import {
  isNetlifyProduction,
  remoteStorageRequiredMessage
} from "@/lib/deployment";
import { collectNewsImages, getPrimaryNewsImage } from "@/lib/news-images";
import { normalizeNewsCategory } from "@/lib/news-categories";
import { slugify } from "@/lib/slug";
import {
  getThemePresetPalette,
  isThemePresetKey,
  type ThemePresetKey
} from "@/lib/theme-presets";

export type MassScheduleItem = {
  id: string;
  title: string;
  date: string;
  day: string;
  masses: string[];
  time: string;
  venue: string;
  detail: string;
  note: string;
  liturgyTitle: string;
  liturgySeason: string;
  liturgyColor: string;
  saintSlug: string;
  readingQuote: string;
  readingReference: string;
  reflectionTheme: string;
};

export type PriestProfile = {
  id: string;
  name: string;
  title: string;
  motto: string;
  bio: string[];
  image?: string;
};

export type ContactDetails = {
  address: string;
  town: string;
  diocese: string;
  phone: string;
  email: string;
  officeHours: string[];
  mapNote: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  period: string;
  detail: string;
  tone: string;
};

export type PastoralUnit = {
  slug: string;
  shortName: string;
  name: string;
  description: string;
  lead: string;
  focus: string[];
};

export type ReflectionItem = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
};

export type NewsItem = {
  id: string;
  slug: string;
  label: string;
  title: string;
  description: string;
  excerpt: string;
  content: string;
  date: string;
  location: string;
  image?: string;
  images?: string[];
  published: boolean;
  likes: number;
};

export type ThemeSettings = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundSoft: string;
};

export type ThemeScheduleItem = {
  id: string;
  label: string;
  preset: ThemePresetKey;
  startDate: string;
  endDate: string;
  enabled: boolean;
};

export type AssociationItem = {
  slug: string;
  shortName: string;
  name: string;
  description: string;
  lead: string;
  meeting: string;
  focus: string[];
  image?: string;
};

export type SaintItem = {
  id: string;
  slug: string;
  name: string;
  title: string;
  feastDay: string;
  displayDate: string;
  excerpt: string;
  story: string;
  image?: string;
  published: boolean;
};

export type PrayerItem = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  published: boolean;
};

export type AnnouncementItem = {
  id: string;
  title: string;
  detail: string;
  date: string;
  tag: string;
};

export type ParishHistory = {
  heading: string;
  summary: string;
  milestones: string[];
  body: string[];
};

export type DocumentItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  date: string;
  fileUrl: string;
  coverImage?: string;
  published: boolean;
};

export type SiteContent = {
  homeIntro: string;
  welcomeMessage: string;
  mission: string;
  churchTimesNote: string;
  themePreset: ThemePresetKey;
  theme: ThemeSettings;
  themeSchedule: ThemeScheduleItem[];
  parishHistory: ParishHistory;
  massSchedule: MassScheduleItem[];
  priests: PriestProfile[];
  contact: ContactDetails;
  gallery: GalleryItem[];
  pastoralUnits: PastoralUnit[];
  associations: AssociationItem[];
  saints: SaintItem[];
  prayers: PrayerItem[];
  reflections: ReflectionItem[];
  newsItems: NewsItem[];
  documents: DocumentItem[];
  announcements: AnnouncementItem[];
};

const contentFilePath = path.join(process.cwd(), "data", "site-content.json");

const defaultContent: SiteContent = {
  homeIntro: "",
  welcomeMessage: "",
  mission: "",
  churchTimesNote: "",
  themePreset: "gold",
  theme: getThemePresetPalette("gold"),
  themeSchedule: [],
  parishHistory: {
    heading: "",
    summary: "",
    milestones: [],
    body: []
  },
  massSchedule: [],
  priests: [],
  contact: {
    address: "",
    town: "",
    diocese: "",
    phone: "",
    email: "",
    officeHours: [],
    mapNote: ""
  },
  gallery: [],
  pastoralUnits: [],
  associations: [],
  saints: [],
  prayers: [],
  reflections: [],
  newsItems: [],
  documents: [],
  announcements: []
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function asScheduleLines(value: unknown) {
  if (Array.isArray(value)) {
    return asStringArray(value);
  }

  return asString(value)
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeColor(value: unknown, fallback: string) {
  const color = asString(value).trim();

  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
}

function withId(prefix: string, value: string, index: number) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || `${prefix}-${index + 1}`;
}

function sanitizeMassSchedule(value: unknown): MassScheduleItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const entry = item as Partial<MassScheduleItem>;
    const title = asString(entry.title);
    const masses = asScheduleLines(entry.masses).length
      ? asScheduleLines(entry.masses)
      : asString(entry.time)
        ? [asString(entry.time)]
        : [];
    const venue = asString(entry.venue) || asString(entry.detail);
    const detail = asString(entry.detail) || venue;

    return {
      id: asString(entry.id) || withId("mass", title, index),
      title,
      date: asString(entry.date),
      day: asString(entry.day),
      masses,
      time: asString(entry.time) || masses[0] || "",
      venue,
      detail,
      note: asString(entry.note),
      liturgyTitle: asString(entry.liturgyTitle),
      liturgySeason: asString(entry.liturgySeason),
      liturgyColor: asString(entry.liturgyColor),
      saintSlug: asString(entry.saintSlug),
      readingQuote: asString(entry.readingQuote),
      readingReference: asString(entry.readingReference),
      reflectionTheme: asString(entry.reflectionTheme)
    };
  });
}

function sanitizePriests(
  value: unknown,
  legacyPriest?: {
    name?: unknown;
    title?: unknown;
    motto?: unknown;
    bio?: unknown;
  }
): PriestProfile[] {
  const source = Array.isArray(value)
    ? value
    : legacyPriest
      ? [
          {
            id: "priest-1",
            name: legacyPriest.name,
            title: legacyPriest.title,
            motto: legacyPriest.motto,
            bio: legacyPriest.bio
          }
        ]
      : [];

  return source.map((item, index) => {
    const entry = item as Partial<PriestProfile>;
    const name = asString(entry.name);

    return {
      id: asString(entry.id) || withId("priest", name, index),
      name,
      title: asString(entry.title),
      motto: asString(entry.motto),
      bio: asStringArray(entry.bio),
      image: asString(entry.image)
    };
  });
}

function sanitizeGallery(value: unknown): GalleryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const entry = item as Partial<GalleryItem>;
    const title = asString(entry.title);

    return {
      id: asString(entry.id) || withId("gallery", title, index),
      title,
      period: asString(entry.period),
      detail: asString(entry.detail),
      tone: asString(entry.tone) || "gold"
    };
  });
}

function sanitizePastoralUnits(value: unknown): PastoralUnit[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const entry = item as Partial<PastoralUnit> & {
      memberCount?: unknown;
    };
    const name = asString(entry.name);

    return {
      slug: asString(entry.slug) || withId("pastoral", name, index),
      shortName: asString(entry.shortName),
      name,
      description: asString(entry.description),
      lead: asString(entry.lead) || asString(entry.memberCount),
      focus: asStringArray(entry.focus)
    };
  });
}

function sanitizeReflections(value: unknown): ReflectionItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const entry = item as Partial<ReflectionItem>;
    const title = asString(entry.title);

    return {
      id: asString(entry.id) || withId("reflection", title, index),
      category: asString(entry.category),
      title,
      excerpt: asString(entry.excerpt),
      date: asString(entry.date),
      author: asString(entry.author)
    };
  });
}

function sanitizeNewsItems(value: unknown): NewsItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const entry = item as Partial<NewsItem>;
    const title = asString(entry.title);
    const excerpt = asString(entry.excerpt) || asString(entry.description);
    const content = asString(entry.content) || excerpt;
    const images = collectNewsImages(entry.images, entry.image);

    return {
      id: asString(entry.id) || withId("news", title, index),
      slug: asString(entry.slug) || slugify(title || asString(entry.id), `news-${index + 1}`),
      label: normalizeNewsCategory(asString(entry.label) || "General"),
      title,
      description: asString(entry.description) || excerpt,
      excerpt,
      content,
      date: asString(entry.date),
      location: asString(entry.location),
      image: getPrimaryNewsImage({ image: entry.image, images }),
      images,
      published: asBoolean(entry.published, true),
      likes: asNumber(entry.likes)
    };
  });
}

function sanitizeThemeSettings(value: unknown): ThemeSettings {
  const entry = (value ?? {}) as Partial<ThemeSettings>;

  return {
    primary: sanitizeColor(entry.primary, defaultContent.theme.primary),
    secondary: sanitizeColor(entry.secondary, defaultContent.theme.secondary),
    accent: sanitizeColor(entry.accent, defaultContent.theme.accent),
    background: sanitizeColor(entry.background, defaultContent.theme.background),
    backgroundSoft: sanitizeColor(entry.backgroundSoft, defaultContent.theme.backgroundSoft)
  };
}

function sanitizeThemePreset(value: unknown): ThemePresetKey {
  const preset = asString(value);

  return isThemePresetKey(preset) ? preset : defaultContent.themePreset;
}

function sanitizeThemeSchedule(value: unknown): ThemeScheduleItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const entry = item as Partial<ThemeScheduleItem>;

    return {
      id: asString(entry.id) || withId("theme", `${asString(entry.preset)}-${asString(entry.startDate)}`, index),
      label: asString(entry.label),
      preset: sanitizeThemePreset(entry.preset),
      startDate: asString(entry.startDate),
      endDate: asString(entry.endDate),
      enabled: asBoolean(entry.enabled, true)
    };
  });
}

function sanitizeAssociations(value: unknown): AssociationItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const entry = item as Partial<AssociationItem>;
    const name = asString(entry.name);

    return {
      slug:
        asString(entry.slug) || slugify(name || asString(entry.shortName), `association-${index + 1}`),
      shortName: asString(entry.shortName),
      name,
      description: asString(entry.description),
      lead: asString(entry.lead),
      meeting: asString(entry.meeting),
      focus: asStringArray(entry.focus),
      image: asString(entry.image)
    };
  });
}

function sanitizeSaints(value: unknown): SaintItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const entry = item as Partial<SaintItem>;
    const name = asString(entry.name);

    return {
      id: asString(entry.id) || withId("saint", name, index),
      slug: asString(entry.slug) || slugify(name || asString(entry.id), `saint-${index + 1}`),
      name,
      title: asString(entry.title),
      feastDay: asString(entry.feastDay),
      displayDate: asString(entry.displayDate),
      excerpt: asString(entry.excerpt),
      story: asString(entry.story),
      image: asString(entry.image),
      published: asBoolean(entry.published, true)
    };
  });
}

function sanitizePrayers(value: unknown): PrayerItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const entry = item as Partial<PrayerItem>;
    const title = asString(entry.title);

    return {
      id: asString(entry.id) || withId("prayer", title, index),
      title,
      category: asString(entry.category),
      excerpt: asString(entry.excerpt),
      body: asString(entry.body),
      published: asBoolean(entry.published, true)
    };
  });
}

function sanitizeDocuments(value: unknown): DocumentItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const entry = item as Partial<DocumentItem>;
    const title = asString(entry.title);

    return {
      id: asString(entry.id) || withId("document", title, index),
      slug:
        asString(entry.slug) ||
        slugify(title || asString(entry.id), `document-${index + 1}`),
      title,
      category: asString(entry.category) || "Bulletin",
      summary: asString(entry.summary),
      date: asString(entry.date),
      fileUrl: asString(entry.fileUrl),
      coverImage: asString(entry.coverImage),
      published: asBoolean(entry.published, true)
    };
  });
}

function sanitizeAnnouncements(value: unknown): AnnouncementItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const entry = item as Partial<AnnouncementItem>;
    const title = asString(entry.title);

    return {
      id: asString(entry.id) || withId("announcement", title, index),
      title,
      detail: asString(entry.detail),
      date: asString(entry.date),
      tag: asString(entry.tag)
    };
  });
}

function sanitizeSiteContent(value: unknown): SiteContent {
  const entry = (value ?? {}) as Partial<SiteContent> & {
    priestProfile?: {
      name?: unknown;
      title?: unknown;
      motto?: unknown;
      bio?: unknown;
    };
    dashboardGroups?: unknown;
    blogPosts?: unknown;
  };

  return {
    homeIntro: asString(entry.homeIntro),
    welcomeMessage: asString(entry.welcomeMessage),
    mission: asString(entry.mission),
    churchTimesNote: asString(entry.churchTimesNote),
    themePreset: sanitizeThemePreset((entry as { themePreset?: unknown }).themePreset),
    theme: sanitizeThemeSettings(entry.theme),
    themeSchedule: sanitizeThemeSchedule((entry as { themeSchedule?: unknown }).themeSchedule),
    parishHistory: {
      heading: asString(entry.parishHistory?.heading),
      summary: asString(entry.parishHistory?.summary),
      milestones: asStringArray(entry.parishHistory?.milestones),
      body: asStringArray(entry.parishHistory?.body)
    },
    massSchedule: sanitizeMassSchedule(entry.massSchedule),
    priests: sanitizePriests(entry.priests, entry.priestProfile),
    contact: {
      address: asString(entry.contact?.address),
      town: asString(entry.contact?.town),
      diocese: asString(entry.contact?.diocese),
      phone: asString(entry.contact?.phone),
      email: asString(entry.contact?.email),
      officeHours: asStringArray(entry.contact?.officeHours),
      mapNote: asString(entry.contact?.mapNote)
    },
    gallery: sanitizeGallery(entry.gallery),
    pastoralUnits: sanitizePastoralUnits(entry.pastoralUnits ?? entry.dashboardGroups),
    associations: sanitizeAssociations((entry as { associations?: unknown }).associations),
    saints: sanitizeSaints((entry as { saints?: unknown }).saints),
    prayers: sanitizePrayers((entry as { prayers?: unknown }).prayers),
    reflections: sanitizeReflections(entry.reflections ?? entry.blogPosts),
    newsItems: sanitizeNewsItems(entry.newsItems),
    documents: sanitizeDocuments(entry.documents),
    announcements: sanitizeAnnouncements(entry.announcements)
  };
}

function mergeContentSource(base: unknown, override: unknown): unknown {
  if (Array.isArray(override)) {
    return override;
  }

  if (isRecord(base) && isRecord(override)) {
    const merged: Record<string, unknown> = { ...base };

    Object.keys(override).forEach((key) => {
      const nextValue = override[key];
      const baseValue = base[key];

      merged[key] =
        isRecord(baseValue) && isRecord(nextValue)
          ? mergeContentSource(baseValue, nextValue)
          : nextValue;
    });

    return merged;
  }

  return override;
}

async function readLocalSiteContentSource() {
  try {
    const file = await fs.readFile(contentFilePath, "utf8");
    return JSON.parse(file) as unknown;
  } catch {
    return defaultContent;
  }
}

export async function readSiteContent() {
  const localSource = await readLocalSiteContentSource();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(siteContentTable)
        .select("payload")
        .eq("id", siteContentRowId)
        .maybeSingle();

      if (!error && data?.payload) {
        return sanitizeSiteContent(mergeContentSource(localSource, data.payload));
      }
    } catch {
      // Fall back to the local JSON file when Supabase is unavailable.
    }
  }

  return sanitizeSiteContent(localSource);
}

export async function getSiteContent() {
  noStore();

  return readSiteContent();
}

export async function saveSiteContent(content: SiteContent) {
  const sanitized = sanitizeSiteContent(content);
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { error } = await supabase.from(siteContentTable).upsert({
      id: siteContentRowId,
      payload: sanitized,
      updated_at: new Date().toISOString()
    });

    if (error) {
      throw error;
    }

    return;
  }

  if (isNetlifyProduction()) {
    throw new Error(remoteStorageRequiredMessage);
  }

  await fs.mkdir(path.dirname(contentFilePath), { recursive: true });
  await fs.writeFile(contentFilePath, JSON.stringify(sanitized, null, 2));
}
