import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { CrossIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { getLiturgicalDayInfo, getLiturgicalDayMap } from "@/lib/liturgical-calendar";
import { getSaintSourceLinks } from "@/lib/saint-sources";
import { churchPhotos } from "@/lib/site-media";
import {
  addDaysToDateKey,
  getMassDateLabel,
  getSaintForDate,
  getSaintHref
} from "@/lib/site-runtime";

type SaintDayPageProps = {
  params: Promise<{
    date: string;
  }>;
};

function sentenceCase(value: string) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((item) => item.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

function buildAutomaticStory({
  saintName,
  longDate,
  rank,
  season
}: {
  saintName: string;
  longDate: string;
  rank: string;
  season: string;
}) {
  return [
    `${saintName} is honoured by the Church on ${longDate}.`,
    rank
      ? `The liturgical calendar keeps this day as ${rank.toLowerCase()}, inviting the parish to remember this witness of faith with reverence.`
      : `The parish can keep this saint close in prayer, asking for grace to live faithfully in school, at home, and in service.`,
    season
      ? `Within the season of ${season}, the witness of ${saintName} helps the faithful listen to Christ more deeply and respond with courage.`
      : `Let the witness of ${saintName} draw the parish family into prayer, purity of heart, charity, and steady Catholic devotion.`,
    `Use the Catholic sources below to read more about ${saintName} and keep the saint's story close to your daily prayer.`
  ];
}

export default async function SaintDayPage({ params }: SaintDayPageProps) {
  const { date } = await params;
  const [content, liturgicalDay] = await Promise.all([
    getSiteContent(),
    getLiturgicalDayInfo(date)
  ]);
  const manualSaint = getSaintForDate(content, date, liturgicalDay?.saint?.name || "");
  const saintName = manualSaint?.name || liturgicalDay?.saint?.name || "";

  if (!saintName) {
    notFound();
  }

  const labels = getMassDateLabel(date);
  const storyParagraphs = manualSaint?.story
    ? toParagraphs(manualSaint.story)
    : buildAutomaticStory({
        saintName,
        longDate: labels.longDate,
        rank: liturgicalDay?.saint?.rank || manualSaint?.title || "",
        season: liturgicalDay?.season || ""
      });
  const nearbyDateKeys = Array.from({ length: 9 }, (_, index) => addDaysToDateKey(date, index - 4));
  const nearbyLiturgicalMap = await getLiturgicalDayMap(nearbyDateKeys);
  const nearbyEntries = nearbyDateKeys
    .map((dateKey) => {
      const nearbyLiturgicalDay = nearbyLiturgicalMap[dateKey];
      const nearbySaint = getSaintForDate(content, dateKey, nearbyLiturgicalDay?.saint?.name || "");
      const nearbySaintName = nearbySaint?.name || nearbyLiturgicalDay?.saint?.name || "";

      if (!nearbySaintName) {
        return null;
      }

      return {
        dateKey,
        label: getMassDateLabel(dateKey),
        name: nearbySaintName,
        subtitle: nearbySaint?.title || nearbyLiturgicalDay?.saint?.rank || "",
        href: getSaintHref({
          content,
          dateKey,
          saint: nearbySaint,
          automaticSaint: nearbyLiturgicalDay?.saint ?? null
        })
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const sourceLinks = getSaintSourceLinks(saintName, date);

  return (
    <div className="page">
      <PageIntro
        eyebrow="Saint of the Day"
        title={saintName}
        description={
          manualSaint?.excerpt ||
          `${saintName} is remembered by the Church today.`
        }
        image={manualSaint?.image || churchPhotos.altarInterior.src}
        position="center"
      />

      <section className="section">
        <div className="container story-article">
          <article className="story-article__main">
            <div className="story-card__meta">
              <span>{labels.longDate}</span>
              {manualSaint?.feastDay ? <span>{manualSaint.feastDay}</span> : null}
              {liturgicalDay?.saint?.rank ? <span>{liturgicalDay.saint.rank}</span> : null}
              {liturgicalDay?.color ? <span>Color: {sentenceCase(liturgicalDay.color)}</span> : null}
            </div>
            <div className="story-article__body">
              {storyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="today-panel__actions">
              <Link href="/daily-readings" className="button button--secondary">
                Daily readings
              </Link>
              <Link href="/saints" className="button button--secondary">
                All saints
              </Link>
            </div>
          </article>

          <aside className="story-article__aside">
            <div className="panel panel--soft-stack">
              <span className="section-badge">
                <CrossIcon className="icon" />
                Catholic Sources
              </span>
              <h2>Read more</h2>
              <div className="saint-source-list">
                {sourceLinks.map((source) => (
                  <a
                    key={source.label}
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="saint-source-link"
                  >
                    <strong>{source.label}</strong>
                    <span>{source.note}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="panel panel--soft-stack">
              <span className="section-badge">
                <CrossIcon className="icon" />
                Nearby Saint Days
              </span>
              <div className="saint-day-list">
                {nearbyEntries.map((entry) => (
                  <Link
                    key={entry.dateKey}
                    href={entry.href}
                    className={`saint-day-item${entry.dateKey === date ? " is-active" : ""}`}
                  >
                    <span>{entry.label.shortDate}</span>
                    <strong>{entry.name}</strong>
                    <small>{entry.subtitle || entry.label.weekday}</small>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
