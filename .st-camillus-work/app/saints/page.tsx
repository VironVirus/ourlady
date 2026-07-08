import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { CrossIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { getLiturgicalDayInfo } from "@/lib/liturgical-calendar";
import { getActiveSaint, getSiteDateKey, getVisibleSaints } from "@/lib/site-runtime";
import { churchPhotos, photoBackground } from "@/lib/site-media";

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
  const activeSaint = getActiveSaint(content, dateKey);
  const automaticSaint = liturgicalDay?.saint ?? null;
  const featuredSaint = activeSaint ?? automaticSaint;

  return (
    <div className="page">
      <PageIntro
        eyebrow="Saints"
        title="Saint of the Day"
        description="Walk with the saints, follow today’s witness, and keep Catholic devotion close to student life."
        image={churchPhotos.altarInterior.src}
        position={churchPhotos.altarInterior.position}
      />
      {featuredSaint ? (
        <section className="section section--soft">
          <div className="container story-article">
            <article className="story-article__main">
              <span className="section-badge">
                <CrossIcon className="icon" />
                Saint Today
              </span>
              <h2>{featuredSaint.name}</h2>
              <p>
                {activeSaint?.excerpt ||
                  `${featuredSaint.name} is honoured by the Church today and can lead the chaplaincy community into prayer, courage, and faithful service.`}
              </p>
              <div className="story-card__meta">
                {activeSaint?.feastDay ? <span>{activeSaint.feastDay}</span> : null}
                {automaticSaint?.rank ? <span>{automaticSaint.rank}</span> : null}
                {liturgicalDay?.color ? <span>Color of the Day: {sentenceCase(liturgicalDay.color)}</span> : null}
              </div>
              <div className="today-panel__actions">
                {activeSaint ? (
                  <Link href={`/saints/${activeSaint.slug}`} className="button button--secondary">
                    Read Saint Story
                  </Link>
                ) : null}
                <Link href="/daily-readings" className="text-link">
                  Open daily readings
                </Link>
              </div>
            </article>

            <aside className="story-article__aside">
              <div className="panel panel--soft-stack">
                <span className="section-badge">
                  <CrossIcon className="icon" />
                  Student Companion
                </span>
                <h2>Pray with the saints</h2>
                <p>
                  Today&apos;s saint can stay visible on the website automatically, while fuller stories can still be added from the admin area.
                </p>
                <Link href="/prayers" className="text-link">
                  Open prayers
                </Link>
              </div>
            </aside>
          </div>
        </section>
      ) : null}
      <section className="section">
        <div className="container story-grid">
          {saints.length === 0 ? (
            <div className="panel empty-state">
              <h2>No saint stories have been added yet.</h2>
              <p>When the chaplaincy team adds saint stories, they will appear here and can be scheduled to their proper day.</p>
            </div>
          ) : null}
          {saints.map((item, index) => (
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
                      "linear-gradient(180deg, rgba(17, 12, 9, 0.14), rgba(17, 12, 9, 0.68))"
                    )
                  : index === 0
                    ? photoBackground(churchPhotos.altarInterior)
                    : undefined
              }
            >
              <div className={item.image || index === 0 ? "story-card__content" : undefined}>
                <span className={item.image || index === 0 ? "section-badge section-badge--light" : "section-badge"}>
                  <CrossIcon className="icon" />
                  {item.feastDay}
                </span>
                <h2>{item.name}</h2>
                <p>{item.excerpt}</p>
                <div className={item.image || index === 0 ? "story-card__meta story-card__meta--light" : "story-card__meta"}>
                  <span>{item.title}</span>
                </div>
                <Link
                  href={`/saints/${item.slug}`}
                  className={item.image || index === 0 ? "button button--ghost" : "text-link"}
                >
                  Read story
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
