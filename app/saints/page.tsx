import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { CrossIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { getLiturgicalDayInfo, getLiturgicalDayMap } from "@/lib/liturgical-calendar";
import { churchPhotos, photoBackground } from "@/lib/site-media";
import {
  addDaysToDateKey,
  getMassDateLabel,
  getSaintForDate,
  getSaintHref,
  getSiteDateKey,
  getVisibleSaints
} from "@/lib/site-runtime";

function sentenceCase(value: string) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function SaintsPage() {
  const dateKey = getSiteDateKey();
  const [content, liturgicalDay] = await Promise.all([
    getSiteContent(),
    getLiturgicalDayInfo(dateKey)
  ]);
  const saints = getVisibleSaints(content);
  const featuredSaint = getSaintForDate(content, dateKey, liturgicalDay?.saint?.name || "");
  const featuredName = featuredSaint?.name || liturgicalDay?.saint?.name || "Saint of the Day";
  const featuredHref = getSaintHref({
    content,
    dateKey,
    saint: featuredSaint,
    automaticSaint: liturgicalDay?.saint ?? null
  });
  const dateKeys = Array.from({ length: 12 }, (_, index) => addDaysToDateKey(dateKey, index - 2));
  const liturgicalMap = await getLiturgicalDayMap(dateKeys);
  const saintDays = dateKeys
    .map((entryDate) => {
      const entryLiturgicalDay = liturgicalMap[entryDate];
      const entrySaint = getSaintForDate(content, entryDate, entryLiturgicalDay?.saint?.name || "");
      const name = entrySaint?.name || entryLiturgicalDay?.saint?.name || "";

      if (!name) {
        return null;
      }

      return {
        dateKey: entryDate,
        labels: getMassDateLabel(entryDate),
        name,
        title: entrySaint?.title || entryLiturgicalDay?.saint?.rank || "",
        color: entryLiturgicalDay?.color || "",
        href: getSaintHref({
          content,
          dateKey: entryDate,
          saint: entrySaint,
          automaticSaint: entryLiturgicalDay?.saint ?? null
        })
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="page">
      <PageIntro
        eyebrow="Saints"
        title="Saints and Feast Days"
        description="Follow today’s saint and browse nearby feast days with a simple Catholic reading flow."
        image={churchPhotos.altarInterior.src}
        position={churchPhotos.altarInterior.position}
      />

      <section className="section section--soft">
        <div className="container story-article">
          <article
            className="story-card story-card--photo"
            style={photoBackground(churchPhotos.altarInterior)}
          >
            <div className="story-card__content">
              <span className="section-badge section-badge--light">
                <CrossIcon className="icon" />
                Saint Today
              </span>
              <h2>{featuredName}</h2>
              <p>
                {featuredSaint?.excerpt ||
                  `${featuredName} is remembered by the Church today and can guide the parish family in prayer and faithful witness.`}
              </p>
              <div className="story-card__meta story-card__meta--light">
                <span>{getMassDateLabel(dateKey).longDate}</span>
                {liturgicalDay?.color ? <span>{sentenceCase(liturgicalDay.color)}</span> : null}
              </div>
              <Link href={featuredHref} className="button button--ghost">
                Open saint story
              </Link>
            </div>
          </article>

          <aside className="story-article__aside">
            <div className="panel panel--soft-stack">
              <span className="section-badge">
                <CrossIcon className="icon" />
                Daily Catholic Flow
              </span>
              <h2>Pray with the Church</h2>
              <p>Open the saint of the day, then continue into the readings, prayer, and reflection for the same date.</p>
              <div className="today-panel__actions">
                <Link href={featuredHref} className="button button--secondary">
                  Saint of the day
                </Link>
                <Link href="/daily-readings" className="button button--secondary">
                  Daily readings
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container section__heading">
          <div>
            <div className="eyebrow">Saint Calendar</div>
            <h2>Nearby Feast Days</h2>
          </div>
        </div>
        <div className="container saint-day-grid">
          {saintDays.map((entry) => (
            <Link
              key={entry.dateKey}
              href={entry.href}
              className={`saint-day-card${entry.dateKey === dateKey ? " is-active" : ""}`}
            >
              <span>{entry.labels.longDate}</span>
              <strong>{entry.name}</strong>
              <small>{entry.title || entry.labels.weekday}</small>
              {entry.color ? <em>{sentenceCase(entry.color)}</em> : null}
            </Link>
          ))}
        </div>
      </section>

      {saints.length > 0 ? (
        <section className="section section--soft">
          <div className="container section__heading">
            <div>
              <div className="eyebrow">Parish Saint Library</div>
              <h2>Added Saint Stories</h2>
            </div>
          </div>
          <div className="container story-grid">
            {saints.map((item) => (
              <article
                key={item.id}
                className={`story-card${item.image ? " story-card--photo" : ""}`}
                style={
                  item.image
                    ? photoBackground(
                        {
                          src: item.image,
                          alt: item.name,
                          position: "center"
                        },
                        "linear-gradient(180deg, rgba(17, 12, 9, 0.18), rgba(17, 12, 9, 0.72))"
                      )
                    : undefined
                }
              >
                <div className={item.image ? "story-card__content" : undefined}>
                  <span className={item.image ? "section-badge section-badge--light" : "section-badge"}>
                    <CrossIcon className="icon" />
                    {item.feastDay || item.title}
                  </span>
                  <h2>{item.name}</h2>
                  <p>{item.excerpt}</p>
                  <Link
                    href={`/saints/${item.slug}`}
                    className={item.image ? "button button--ghost" : "text-link"}
                  >
                    Read story
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
