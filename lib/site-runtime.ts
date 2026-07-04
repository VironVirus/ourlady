import type { PrayerItem, SaintItem, SiteContent } from "@/lib/content";
import { getThemePresetPalette } from "@/lib/theme-presets";

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
