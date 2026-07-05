import type { MassScheduleItem, PrayerItem, SaintItem, SiteContent } from "@/lib/content";
import {
  getThemePresetPalette,
  mapLiturgicalColorToThemePreset
} from "@/lib/theme-presets";

export const siteTimeZone = "Africa/Lagos";

function getDatePart(parts: Intl.DateTimeFormatPart[], type: "year" | "month" | "day") {
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function getSiteDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: siteTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  return `${getDatePart(parts, "year")}-${getDatePart(parts, "month")}-${getDatePart(parts, "day")}`;
}

function toSiteDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map((value) => Number.parseInt(value, 10));

  return new Date(Date.UTC(year, (month || 1) - 1, day || 1, 12));
}

function formatSiteDate(
  dateKey: string,
  options: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: siteTimeZone,
    ...options
  }).format(toSiteDate(dateKey));
}

export function addDaysToDateKey(dateKey: string, offset: number) {
  const nextDate = toSiteDate(dateKey);

  nextDate.setUTCDate(nextDate.getUTCDate() + offset);

  return getSiteDateKey(nextDate);
}

export function getDateKeyRange(startDateKey = getSiteDateKey(), days = 7) {
  return Array.from({ length: days }, (_, index) => addDaysToDateKey(startDateKey, index));
}

export function getMassTimes(item: MassScheduleItem) {
  return item.masses.length > 0
    ? item.masses
    : item.time
      ? [item.time]
      : [];
}

export function getMassVenue(item: MassScheduleItem) {
  return item.venue || item.detail;
}

export function getMassEntryForDate(content: SiteContent, dateKey = getSiteDateKey()) {
  return getRollingMassWeek(content, dateKey, 1)[0] ?? null;
}

function mergeMassScheduleItems(items: MassScheduleItem[], dateKey: string): MassScheduleItem {
  const [firstItem] = items;
  const masses = items.flatMap(getMassTimes).filter(Boolean);
  const venue = items.map(getMassVenue).find(Boolean) || "";
  const note = items.map((item) => item.note).find(Boolean) || "";
  const liturgyTitle = items.map((item) => item.liturgyTitle).find(Boolean) || "";
  const liturgySeason = items.map((item) => item.liturgySeason).find(Boolean) || "";
  const liturgyColor = items.map((item) => item.liturgyColor).find(Boolean) || "";
  const saintSlug = items.map((item) => item.saintSlug).find(Boolean) || "";
  const readingQuote = items.map((item) => item.readingQuote).find(Boolean) || "";
  const readingReference = items.map((item) => item.readingReference).find(Boolean) || "";
  const reflectionTheme = items.map((item) => item.reflectionTheme).find(Boolean) || "";

  return {
    ...firstItem,
    date: dateKey,
    masses,
    time: masses[0] || firstItem.time,
    venue,
    detail: venue || firstItem.detail,
    note,
    liturgyTitle,
    liturgySeason,
    liturgyColor,
    saintSlug,
    readingQuote,
    readingReference,
    reflectionTheme
  };
}

export function getMassDateLabel(dateKey: string) {
  return {
    weekday: formatSiteDate(dateKey, { weekday: "long" }),
    shortWeekday: formatSiteDate(dateKey, { weekday: "short" }),
    shortDate: formatSiteDate(dateKey, { day: "numeric", month: "short" }),
    longDate: formatSiteDate(dateKey, { day: "numeric", month: "long", year: "numeric" })
  };
}

export function getRollingMassWeek(
  content: SiteContent,
  startDateKey = getSiteDateKey(),
  days = 7
) {
  const groupedSchedule = new Map<string, MassScheduleItem[]>();

  content.massSchedule
    .filter((item) => item.date)
    .forEach((item) => {
      const existingItems = groupedSchedule.get(item.date) ?? [];

      existingItems.push(item);
      groupedSchedule.set(item.date, existingItems);
    });

  return getDateKeyRange(startDateKey, days).map((dateKey) => {
    const items = groupedSchedule.get(dateKey) ?? [];

    return {
      dateKey,
      labels: getMassDateLabel(dateKey),
      isToday: dateKey === startDateKey,
      item: items.length > 0 ? mergeMassScheduleItems(items, dateKey) : null
    };
  });
}

function isDateInRange(dateKey: string, startDate: string, endDate?: string) {
  if (!startDate || dateKey < startDate) {
    return false;
  }

  if (endDate && dateKey > endDate) {
    return false;
  }

  return true;
}

export function resolveThemeSettings(content: SiteContent, dateKey = getSiteDateKey()) {
  const activeSchedule = [...content.themeSchedule]
    .filter((item) => item.enabled)
    .sort((left, right) => right.startDate.localeCompare(left.startDate))
    .find((item) => isDateInRange(dateKey, item.startDate, item.endDate));

  return getThemePresetPalette(activeSchedule?.preset || content.themePreset, content.theme);
}

export function resolveThemePreset(
  content: SiteContent,
  dateKey = getSiteDateKey(),
  liturgicalColor = ""
) {
  const activeSchedule = [...content.themeSchedule]
    .filter((item) => item.enabled)
    .sort((left, right) => right.startDate.localeCompare(left.startDate))
    .find((item) => isDateInRange(dateKey, item.startDate, item.endDate));

  if (activeSchedule?.preset) {
    return activeSchedule.preset;
  }

  if (liturgicalColor) {
    return mapLiturgicalColorToThemePreset(liturgicalColor);
  }

  return content.themePreset;
}

function saintSort(left: SaintItem, right: SaintItem) {
  return (right.displayDate || "").localeCompare(left.displayDate || "") || left.name.localeCompare(right.name);
}

export function getVisibleSaints(content: SiteContent, dateKey = getSiteDateKey()) {
  return content.saints
    .filter((item) => item.published && (!item.displayDate || item.displayDate <= dateKey))
    .sort(saintSort);
}

export function getActiveSaint(content: SiteContent, dateKey = getSiteDateKey()) {
  return getVisibleSaints(content, dateKey).find((item) => item.displayDate === dateKey) ?? null;
}

export function getVisiblePrayers(content: SiteContent) {
  return content.prayers.filter((item) => item.published);
}

export function summarizePrayer(prayer: PrayerItem) {
  return prayer.excerpt || prayer.body.split(/\n+/).find(Boolean) || "";
}
