import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { ClockIcon, CrossIcon, SparkIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { getLiturgicalDayMap } from "@/lib/liturgical-calendar";
import {
  getMassTimes,
  getMassVenue,
  getRollingMassWeek
} from "@/lib/site-runtime";
import { churchPhotos } from "@/lib/site-media";

function sentenceCase(value: string) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function MassSchedulePage() {
  const content = await getSiteContent();
  const rollingWeek = getRollingMassWeek(content);
  const liturgicalMap = await getLiturgicalDayMap(rollingWeek.map((entry) => entry.dateKey));
  const saintsBySlug = new Map(
    content.saints
      .filter((item) => item.published)
      .map((item) => [item.slug, item] as const)
  );
  const saintsByDate = new Map(
    content.saints
      .filter((item) => item.published && item.displayDate)
      .map((item) => [item.displayDate, item] as const)
  );

  return (
    <div className="page">
      <PageIntro
        eyebrow="Mass"
        title="Mass Schedule"
        description={content.churchTimesNote || "Worship with us."}
        image={churchPhotos.altarInterior.src}
        position={churchPhotos.altarInterior.position}
      />

      <section className="section section--soft">
        <div className="container section__heading">
          <div>
            <div className="eyebrow">Next 7 Days</div>
            <h2>Weekly Worship Planner</h2>
          </div>
        </div>

        <div className="container mass-week-grid">
          {rollingWeek.map((entry) => {
            const item = entry.item;
            const liturgicalDay = liturgicalMap[entry.dateKey];
            const saint =
              (item?.saintSlug ? saintsBySlug.get(item.saintSlug) : null) ??
              saintsByDate.get(entry.dateKey) ??
              null;
            const automaticSaint = !saint && liturgicalDay?.saint ? liturgicalDay.saint : null;
            const celebration = item?.liturgyTitle || liturgicalDay?.title || "";
            const season = item?.liturgySeason || liturgicalDay?.season || "";
            const liturgicalColor = item?.liturgyColor || liturgicalDay?.color || "";
            const massTimes = item ? getMassTimes(item) : [];
            const venue = item ? getMassVenue(item) : "";

            return (
              <article
                key={entry.dateKey}
                className={`schedule-card schedule-card--clean mass-day-card${
                  entry.isToday ? " mass-day-card--today" : ""
                }`}
              >
                <div className="mass-day-card__top">
                  <div>
                    <span className="story-card__tag">
                      {entry.isToday ? "Today" : entry.labels.weekday}
                    </span>
                    <h2>{entry.labels.longDate}</h2>
                  </div>
                  <span className="schedule-card__icon">
                    <ClockIcon className="icon" />
                  </span>
                </div>

                {celebration || season || liturgicalColor ? (
                  <div className="mass-day-card__chips">
                    {celebration ? (
                      <span className="chip chip--soft">
                        <SparkIcon className="icon icon--tiny" />
                        {celebration}
                      </span>
                    ) : null}
                    {season ? <span className="chip">{season}</span> : null}
                    {liturgicalColor ? <span className="chip">{sentenceCase(liturgicalColor)}</span> : null}
                  </div>
                ) : null}

                {saint ? (
                  <Link href={`/saints/${saint.slug}`} className="mass-day-card__saint">
                    <CrossIcon className="icon icon--tiny" />
                    Saint of the day: {saint.name}
                  </Link>
                ) : automaticSaint ? (
                  <Link href="/saints" className="mass-day-card__saint">
                    <CrossIcon className="icon icon--tiny" />
                    Saint of the day: {automaticSaint.name}
                  </Link>
                ) : null}

                {item ? (
                  <>
                    <div className="mass-day-card__details">
                      <strong>{item.title || "Mass Schedule"}</strong>
                      {venue ? <span>{venue}</span> : null}
                    </div>
                    <ul className="mass-times-list">
                      {massTimes.map((massTime) => (
                        <li key={`${entry.dateKey}-${massTime}`}>{massTime}</li>
                      ))}
                    </ul>
                    {item.note ? (
                      <p className="mass-day-card__note">{item.note}</p>
                    ) : entry.source === "default" ? (
                      <p className="mass-day-card__note">Regular chaplaincy Mass schedule.</p>
                    ) : null}
                  </>
                ) : (
                  <div className="mass-day-card__empty">
                    <strong>No Mass added yet.</strong>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
