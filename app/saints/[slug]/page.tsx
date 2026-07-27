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
  getSaintHref,
  getSiteDateKey,
  getVisibleSaints
} from "@/lib/site-runtime";

type SaintPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const content = await getSiteContent();

  return getVisibleSaints(content).map((item) => ({
    slug: item.slug
  }));
}

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

export default async function SaintPage({ params }: SaintPageProps) {
  const content = await getSiteContent();
  const { slug } = await params;
  const item = getVisibleSaints(content).find((entry) => entry.slug === slug);

  if (!item) {
    notFound();
  }

  const story = toParagraphs(item.story);
  const dateKey = item.displayDate || getSiteDateKey();
  const liturgicalDay = await getLiturgicalDayInfo(dateKey);
  const sourceLinks = getSaintSourceLinks(item.name, dateKey);
  const nearbyDateKeys = Array.from({ length: 9 }, (_, index) => addDaysToDateKey(dateKey, index - 4));
  const nearbyLiturgicalMap = await getLiturgicalDayMap(nearbyDateKeys);
  const nearbyEntries = nearbyDateKeys
    .map((entryDate) => {
      const entryLiturgicalDay = nearbyLiturgicalMap[entryDate];
      const entrySaint = getSaintForDate(content, entryDate, entryLiturgicalDay?.saint?.name || "");
      const entrySaintName = entrySaint?.name || entryLiturgicalDay?.saint?.name || "";

      if (!entrySaintName) {
        return null;
      }

      return {
        dateKey: entryDate,
        label: getMassDateLabel(entryDate),
        name: entrySaintName,
        subtitle: entrySaint?.title || entryLiturgicalDay?.saint?.rank || "",
        href: getSaintHref({
          content,
          dateKey: entryDate,
          saint: entrySaint,
          automaticSaint: entryLiturgicalDay?.saint ?? null
        })
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <div className="page">
      <PageIntro
        eyebrow="Saint of the Day"
        title={item.name}
        description={item.excerpt}
        image={item.image || churchPhotos.altarInterior.src}
        position="center"
      />
      <section className="section">
        <div className="container story-article">
          <div className="story-article__main">
            <div className="story-card__meta">
              <span>{item.feastDay || getMassDateLabel(dateKey).longDate}</span>
              <span>{item.title}</span>
              {liturgicalDay?.color ? <span>Color: {sentenceCase(liturgicalDay.color)}</span> : null}
            </div>
            <div className="story-article__body">
              {story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <aside className="story-article__aside">
            <div className="panel panel--soft-stack">
              <span className="section-badge">
                <CrossIcon className="icon" />
                Saint Story
              </span>
              <h2>Prayer and reflection</h2>
              <p>{item.excerpt || "Read the saint's witness slowly and let it lead you into prayer."}</p>
            </div>

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
                Feast Day
              </span>
              <h2>{item.feastDay || item.name}</h2>
              <p>{item.title || "Saint of the Church"}</p>
              <div className="today-panel__actions">
                <Link href="/daily-readings" className="text-link">
                  Open daily readings
                </Link>
                <Link href="/prayers" className="text-link">
                  Open prayers
                </Link>
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
                    className={`saint-day-item${entry.href === `/saints/${item.slug}` ? " is-active" : ""}`}
                  >
                    <span>{entry.label.shortDate}</span>
                    <strong>{entry.name}</strong>
                    <small>{entry.subtitle || entry.label.weekday}</small>
                  </Link>
                ))}
              </div>
            </div>

            <div className="panel panel--soft-stack">
              <span className="section-badge">
                <CrossIcon className="icon" />
                CYON Focus
              </span>
              <h2>Live the witness</h2>
              <p>
                Share this saint story with the youth and use it as a reflection point for service, purity, courage, charity, and faithfulness.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
