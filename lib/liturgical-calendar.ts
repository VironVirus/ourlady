import { cache } from "react";
import { GeneralRoman_En } from "@romcal/calendar.general-roman";
import { Romcal } from "romcal";
import { getDailyReadingsInfo, type DailyReadingsInfo } from "@/lib/daily-readings";

type RomcalDay = {
  id?: string;
  name?: string;
  rankName?: string;
  seasonNames?: string[];
  colorNames?: string[];
  seasons?: string[];
  colors?: string[];
  cycles?: {
    properCycle?: string;
  };
  martyrology?: Array<{
    id?: string;
    titles?: string[];
  }>;
};

type RomcalCalendar = Record<string, RomcalDay[]>;

export type LiturgicalSaintInfo = {
  id: string;
  name: string;
  rank: string;
};

export type LiturgicalDayInfo = {
  date: string;
  title: string;
  rank: string;
  season: string;
  color: string;
  saint: LiturgicalSaintInfo | null;
  readings: DailyReadingsInfo | null;
};

const romcal = new Romcal({
  localizedCalendar: GeneralRoman_En
});

const getCalendarForYear = cache(async (year: number) => {
  return (await romcal.generateCalendar(year)) as RomcalCalendar;
});

function getLiturgicalSaint(days: RomcalDay[]) {
  const saintEntry =
    days.find((item) => (item.martyrology?.length ?? 0) > 0) ??
    days.find((item) => item.cycles?.properCycle === "PROPER_OF_SAINTS");

  if (!saintEntry?.name) {
    return null;
  }

  return {
    id: saintEntry.id || saintEntry.name,
    name: saintEntry.name,
    rank: saintEntry.rankName || ""
  } satisfies LiturgicalSaintInfo;
}

function normalizeLiturgicalDay(
  dateKey: string,
  days: RomcalDay[] = [],
  readings: DailyReadingsInfo | null = null
): LiturgicalDayInfo | null {
  const input = days[0];

  if (!input) {
    return null;
  }

  return {
    date: dateKey,
    title: input.name || "",
    rank: input.rankName || "",
    season: input.seasonNames?.[0] || input.seasons?.[0] || "",
    color: input.colorNames?.[0] || input.colors?.[0] || "",
    saint: getLiturgicalSaint(days),
    readings
  };
}

export async function getLiturgicalDayInfo(dateKey: string) {
  const year = Number.parseInt(dateKey.slice(0, 4), 10);
  const [calendar, readings] = await Promise.all([
    getCalendarForYear(year),
    getDailyReadingsInfo(dateKey)
  ]);

  return normalizeLiturgicalDay(dateKey, calendar[dateKey] ?? [], readings);
}

export async function getLiturgicalDayMap(dateKeys: string[]) {
  const uniqueDateKeys = [...new Set(dateKeys)];
  const years = [...new Set(uniqueDateKeys.map((dateKey) => Number.parseInt(dateKey.slice(0, 4), 10)))];
  const calendars = await Promise.all(
    years.map(async (year) => [year, await getCalendarForYear(year)] as const)
  );
  const calendarMap = new Map<number, RomcalCalendar>(calendars);

  return Object.fromEntries(
    uniqueDateKeys.map((dateKey) => {
      const year = Number.parseInt(dateKey.slice(0, 4), 10);

      return [dateKey, normalizeLiturgicalDay(dateKey, calendarMap.get(year)?.[dateKey] ?? [])];
    })
  ) as Record<string, LiturgicalDayInfo | null>;
}
