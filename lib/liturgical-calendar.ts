import { cache } from "react";
import { GeneralRoman_En } from "@romcal/calendar.general-roman";
import { Romcal } from "romcal";

type RomcalDay = {
  name?: string;
  rankName?: string;
  seasonNames?: string[];
  colorNames?: string[];
  seasons?: string[];
  colors?: string[];
};

type RomcalCalendar = Record<string, RomcalDay[]>;

export type LiturgicalDayInfo = {
  date: string;
  title: string;
  rank: string;
  season: string;
  color: string;
};

const romcal = new Romcal({
  localizedCalendar: GeneralRoman_En
});

const getCalendarForYear = cache(async (year: number) => {
  return (await romcal.generateCalendar(year)) as RomcalCalendar;
});

function normalizeLiturgicalDay(dateKey: string, input?: RomcalDay): LiturgicalDayInfo | null {
  if (!input) {
    return null;
  }

  return {
    date: dateKey,
    title: input.name || "",
    rank: input.rankName || "",
    season: input.seasonNames?.[0] || input.seasons?.[0] || "",
    color: input.colorNames?.[0] || input.colors?.[0] || ""
  };
}

export async function getLiturgicalDayInfo(dateKey: string) {
  const year = Number.parseInt(dateKey.slice(0, 4), 10);
  const calendar = await getCalendarForYear(year);

  return normalizeLiturgicalDay(dateKey, calendar[dateKey]?.[0]);
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

      return [dateKey, normalizeLiturgicalDay(dateKey, calendarMap.get(year)?.[dateKey]?.[0])];
    })
  ) as Record<string, LiturgicalDayInfo | null>;
}
