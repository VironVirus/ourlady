import { cache } from "react";

export type DailyReadingReference = {
  label: string;
  citation: string;
  text?: string;
};

export type DailyReadingsInfo = {
  date: string;
  title: string;
  lectionary: string;
  references: DailyReadingReference[];
  sourceLabel: string;
  sourceUrl: string;
  textSourceLabel: string;
  translationLabel: string;
};

const sectionLabels = [
  "Reading 1",
  "Reading 2",
  "Responsorial Psalm",
  "Sequence",
  "Alleluia",
  "Verse Before the Gospel",
  "Gospel"
] as const;

const bibleApiBaseUrl = "https://bible-api.com";
const bibleApiTranslationId = "dra";
const bibleApiTranslationLabel = "Douay-Rheims 1899 American Edition";

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, "'")
    .replace(/&ndash;/gi, "-")
    .replace(/&mdash;/gi, "-")
    .replace(/&hellip;/gi, "...")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
}

function normalizeLines(source: string) {
  const withBreaks = source
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(
      /<(?:\/?(?:p|div|section|article|aside|main|header|footer|li|ul|ol|table|tr|h1|h2|h3|h4|h5|h6)|br\s*\/?)>/gi,
      "\n"
    )
    .replace(/<[^>]+>/g, " ");

  return decodeHtmlEntities(withBreaks)
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function getUsccbReadingsUrl(dateKey: string) {
  const [year, month, day] = dateKey.split("-");
  const shortYear = year.slice(-2);

  return `https://bible.usccb.org/bible/readings/${month}${day}${shortYear}.cfm`;
}

function normalizeBibleApiCitation(citation: string) {
  return citation
    .replace(/^cf\.\s*/i, "")
    .replace(/[–—]/g, "-")
    .replace(/(\d)([a-z])\b/gi, "$1")
    .replace(/\s+(?:or|OR)\s+.+$/g, "")
    .replace(/^Psalm\s+/i, "Psalms ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchReadingPassage(citation: string) {
  const normalizedCitation = normalizeBibleApiCitation(citation);

  if (!normalizedCitation) {
    return "";
  }

  try {
    const response = await fetch(
      `${bibleApiBaseUrl}/${encodeURIComponent(normalizedCitation)}?translation=${bibleApiTranslationId}`,
      {
        next: {
          revalidate: 21600
        }
      }
    );

    if (!response.ok) {
      return "";
    }

    const payload = (await response.json()) as {
      error?: string;
      text?: string;
    };

    return payload.error ? "" : payload.text?.trim() || "";
  } catch {
    return "";
  }
}

function parseDailyReadings(dateKey: string, source: string): DailyReadingsInfo | null {
  const lines = normalizeLines(source);
  const lectionaryIndex = lines.findIndex((line) => /^Lectionary:/i.test(line));

  if (lectionaryIndex < 1) {
    return null;
  }

  const stopIndex = lines.findIndex(
    (line, index) =>
      index > lectionaryIndex &&
      (/^Lectionary for Mass for Use/i.test(line) ||
        /^Get the Daily Readings$/i.test(line) ||
        /^Dive into God's Word$/i.test(line))
  );
  const scopedLines = stopIndex > lectionaryIndex ? lines.slice(0, stopIndex) : lines;
  const references = sectionLabels.flatMap((label) => {
    const labelIndex = scopedLines.findIndex((line) => line === label);

    if (labelIndex < 0) {
      return [];
    }

    const citation = scopedLines[labelIndex + 1]?.trim() || "";

    if (!citation || sectionLabels.includes(citation as (typeof sectionLabels)[number])) {
      return [];
    }

    return [
      {
        label,
        citation
      }
    ];
  });

  if (references.length === 0) {
    return null;
  }

  return {
    date: dateKey,
    title: scopedLines[lectionaryIndex - 1] || "",
    lectionary: scopedLines[lectionaryIndex].replace(/^Lectionary:\s*/i, "").trim(),
    references,
    sourceLabel: "USCCB Daily Readings",
    sourceUrl: getUsccbReadingsUrl(dateKey),
    textSourceLabel: "Bible API",
    translationLabel: bibleApiTranslationLabel
  };
}

const getDailyReadings = cache(async (dateKey: string) => {
  try {
    const response = await fetch(getUsccbReadingsUrl(dateKey), {
      next: {
        revalidate: 21600
      }
    });

    if (!response.ok) {
      return null;
    }

    const parsed = parseDailyReadings(dateKey, await response.text());

    if (!parsed) {
      return null;
    }

    const passageTexts = await Promise.all(
      parsed.references.map(async (reading) => ({
        ...reading,
        text: await fetchReadingPassage(reading.citation)
      }))
    );

    return {
      ...parsed,
      references: passageTexts
    };
  } catch {
    return null;
  }
});

export async function getDailyReadingsInfo(dateKey: string) {
  return getDailyReadings(dateKey);
}

export { getUsccbReadingsUrl };
