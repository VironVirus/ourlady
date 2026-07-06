import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { ClockIcon, CrossIcon, DocumentIcon, SparkIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import type { DailyReadingReference } from "@/lib/daily-readings";
import { getUsccbReadingsUrl } from "@/lib/daily-readings";
import { getLiturgicalDayInfo } from "@/lib/liturgical-calendar";
import { churchPhotos } from "@/lib/site-media";
import {
  getActiveSaint,
  getMassDateLabel,
  getMassEntryForDate,
  getMassTimes,
  getMassVenue,
  getSiteDateKey
} from "@/lib/site-runtime";

function sentenceCase(value: string) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function isGospelAcclamation(reading: DailyReadingReference) {
  return /alleluia|verse before the gospel/i.test(reading.label);
}

function buildOpeningPrayer({
  celebration,
  saintName,
  liturgicalColor
}: {
  celebration: string;
  saintName: string;
  liturgicalColor: string;
}) {
  const dayColor = liturgicalColor ? sentenceCase(liturgicalColor).toLowerCase() : "holy";

  return [
    "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
    `Lord Jesus Christ, as we receive your word on this ${dayColor} day of the Church, open our hearts to listen with faith, pray with attention, and live with charity.`,
    saintName
      ? `Through the prayers of ${saintName}, keep the youth of this parish faithful, joyful, and close to your altar. Amen.`
      : "Keep the youth of this parish faithful, joyful, and close to your altar. Amen."
  ];
}

function buildCyonReflection({
  weekday,
  celebration,
  season,
  saintName,
  liturgicalColor,
  customTheme
}: {
  weekday: string;
  celebration: string;
  season: string;
  saintName: string;
  liturgicalColor: string;
  customTheme: string;
}) {
  const normalizedColor = liturgicalColor.trim().toLowerCase();
  const focus =
    customTheme ||
    (saintName
      ? `Learning from ${saintName}`
      : season
        ? `Living ${season} well`
        : "Walking with Christ today");

  let challenge = "Before the day ends, make time for Mass, quiet prayer, or one sincere act of service.";

  if (normalizedColor.includes("green")) {
    challenge = "Choose one small habit of growth today: pray before class, help at home, or speak peace where there is noise.";
  } else if (normalizedColor.includes("red")) {
    challenge = "Practice courage today: defend what is right, speak the truth gently, and be unashamed of your Catholic faith.";
  } else if (normalizedColor.includes("purple") || normalizedColor.includes("violet")) {
    challenge = "Make room for repentance today: examine your conscience, let go of pride, and return to prayer with humility.";
  } else if (normalizedColor.includes("white") || normalizedColor.includes("gold")) {
    challenge = "Carry the joy of Christ today: keep a clean heart, speak hope, and let your actions show reverence for God.";
  }

  return {
    eyebrow: `CYON Reflection for ${weekday}`,
    title: focus,
    body: saintName
      ? `${celebration} invites CYON members to listen to Christ with the same faith and generosity shown by ${saintName}. Let today's word shape how you speak, how you serve, and how you stand for God in school, at home, and in the parish.`
      : `${celebration} calls the youth of the parish to stay close to Christ today. Receive the word prayerfully, carry it into your friendships and responsibilities, and let your witness be calm, sincere, and Catholic.`,
    challenge
  };
}

export default async function DailyReadingsPage() {
  const dateKey = getSiteDateKey();
  const [content, liturgicalDay] = await Promise.all([
    getSiteContent(),
    getLiturgicalDayInfo(dateKey)
  ]);
  const labels = getMassDateLabel(dateKey);
  const massEntry = getMassEntryForDate(content, dateKey);
  const massItem = massEntry?.item ?? null;
  const activeSaint = getActiveSaint(content, dateKey);
  const automaticSaint = liturgicalDay?.saint ?? null;
  const focusSaint = activeSaint ?? null;
  const massTimes = massItem ? getMassTimes(massItem) : [];
  const reflectionTheme =
    massItem?.reflectionTheme || "Walk with Christ today in prayer, charity, and joyful witness.";
  const liturgicalColor = massItem?.liturgyColor || liturgicalDay?.color || "";
  const season = massItem?.liturgySeason || liturgicalDay?.season || "";
  const celebration = massItem?.liturgyTitle || liturgicalDay?.title || "Daily Readings";
  const readingQuote = massItem?.readingQuote || "";
  const readingReference = massItem?.readingReference || "";
  const venue = massItem ? getMassVenue(massItem) : "";
  const allReadings = liturgicalDay?.readings?.references ?? [];
  const gospelAcclamation = allReadings.find(isGospelAcclamation) ?? null;
  const standardReadings = allReadings.filter((reading) => !isGospelAcclamation(reading));
  const saintName = focusSaint?.name || automaticSaint?.name || "";
  const openingPrayer = buildOpeningPrayer({
    celebration,
    saintName,
    liturgicalColor
  });
  const cyonReflection = buildCyonReflection({
    weekday: labels.weekday,
    celebration,
    season,
    saintName,
    liturgicalColor,
    customTheme: reflectionTheme
  });

  return (
    <div className="page">
      <PageIntro
        eyebrow="CYON Daily Readings"
        title={celebration}
        description="Follow today’s readings, saint of the day, and a simple prayer path for the youth."
        image={churchPhotos.altarInterior.src}
        position={churchPhotos.altarInterior.position}
      />

      <section className="section">
        <div className="container story-article">
          <article className="story-article__main">
            <span className="section-badge">
              <DocumentIcon className="icon" />
              {labels.longDate}
            </span>

            <div className="story-card__meta">
              {liturgicalDay?.rank ? <span>{liturgicalDay.rank}</span> : null}
              {season ? <span>{season}</span> : null}
              {liturgicalColor ? <span>Color of the Day: {sentenceCase(liturgicalColor)}</span> : null}
            </div>

            <div className="daily-devotion-card">
              <span className="section-badge">
                <CrossIcon className="icon" />
                Opening Prayer
              </span>
              <div className="daily-devotion-card__body">
                {openingPrayer.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>

            {readingQuote ? (
              <blockquote className="today-panel__quote">
                <p>{readingQuote}</p>
                {readingReference ? <footer>{readingReference}</footer> : null}
              </blockquote>
            ) : null}

            {liturgicalDay?.readings ? (
              <div className="today-panel__readings">
                <div className="today-panel__readings-head">
                  <span>Daily Readings</span>
                  {liturgicalDay.readings.lectionary ? (
                    <strong>Lectionary {liturgicalDay.readings.lectionary}</strong>
                  ) : null}
                </div>
                <div className="today-panel__reading-list">
                  {standardReadings.map((reading) => (
                    <div
                      key={`${reading.label}-${reading.citation}`}
                      className="today-panel__reading"
                    >
                      <span>{reading.label}</span>
                      <strong>{reading.citation}</strong>
                    </div>
                  ))}
                </div>
                {gospelAcclamation ? (
                  <div className="daily-devotion-card daily-devotion-card--acclamation">
                    <span className="section-badge">
                      <SparkIcon className="icon" />
                      Gospel Acclamation
                    </span>
                    <p className="daily-devotion-card__acclamation-label">
                      {gospelAcclamation.label}
                    </p>
                    <p className="daily-devotion-card__acclamation-text">
                      {gospelAcclamation.citation}
                    </p>
                    <small>
                      Stand with reverence and welcome the Gospel with faith.
                    </small>
                  </div>
                ) : null}
                <a
                  href={liturgicalDay.readings.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  Open full readings
                </a>
              </div>
            ) : (
              <div className="panel panel--soft-stack">
                <span className="section-badge">
                  <DocumentIcon className="icon" />
                  Daily Readings
                </span>
                <p>The reading references are not available right now. You can still open the full readings.</p>
                <a
                  href={getUsccbReadingsUrl(dateKey)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  Open full readings
                </a>
              </div>
            )}
          </article>

          <aside className="story-article__aside">
            <div className="panel panel--soft-stack">
              <span className="section-badge">
                <CrossIcon className="icon" />
                Saint of the Day
              </span>
              <h2>{focusSaint?.name || automaticSaint?.name || "Saint of the Day"}</h2>
              <p>
                {focusSaint?.excerpt ||
                  `${automaticSaint?.name || "Today’s saint"} accompanies the Church in prayer today.`}
              </p>
              <div className="today-panel__actions">
                {focusSaint ? (
                  <Link href={`/saints/${focusSaint.slug}`} className="button button--secondary">
                    Read Saint Story
                  </Link>
                ) : (
                  <Link href="/saints" className="button button--secondary">
                    Open Saints Page
                  </Link>
                )}
              </div>
            </div>

            <div className="panel panel--soft-stack">
              <span className="section-badge">
                <ClockIcon className="icon" />
                Today&apos;s Masses
              </span>
              <h2>{massItem?.title || "Mass Schedule"}</h2>
              {venue ? <p>{venue}</p> : null}
              <ul className="mass-times-list">
                {massTimes.map((massTime) => (
                  <li key={massTime}>{massTime}</li>
                ))}
              </ul>
              <Link href="/mass-schedule" className="text-link">
                View full week
              </Link>
            </div>

            <div className="panel panel--soft-stack">
              <span className="section-badge">
                <SparkIcon className="icon" />
                {cyonReflection.eyebrow}
              </span>
              <h2>{cyonReflection.title}</h2>
              <p>{cyonReflection.body}</p>
              <div className="daily-reflection-note">
                <span>CYON Practice</span>
                <strong>{cyonReflection.challenge}</strong>
              </div>
              <Link href="/prayers" className="text-link">
                Open prayers
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
