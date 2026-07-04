import { PageIntro } from "@/components/page-intro";
import { PriestIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { churchPhotos, photoBackground } from "@/lib/site-media";

export default async function PriestPage() {
  const content = await getSiteContent();
  const [leadPriest, ...otherPriests] = content.priests;

  return (
    <div className="page">
      <PageIntro
        eyebrow="Priests"
        title="Parish Priests"
        description="Pastoral care and leadership."
        image={churchPhotos.priest.src}
        position={churchPhotos.priest.position}
      />
      <section className="section">
        <div className="container split-grid">
          {leadPriest ? (
            <article
              className="photo-card photo-card--tall"
              style={photoBackground(churchPhotos.priest)}
            >
              <div className="photo-card__content">
                <div className="eyebrow eyebrow--light">{leadPriest.title}</div>
                <h2>{leadPriest.name}</h2>
                <p>{leadPriest.motto}</p>
              </div>
            </article>
          ) : null}

          <article className="panel panel--soft-stack">
            <div className="section-badge">
              <PriestIcon className="icon" />
              Clergy
            </div>
            {content.priests.map((priest) => (
              <div key={priest.id} className="feed-item">
                <span>{priest.title}</span>
                <strong>{priest.name}</strong>
                <small>{priest.motto}</small>
              </div>
            ))}
          </article>
        </div>
      </section>

      {otherPriests.length > 0 ? (
        <section className="section section--soft">
          <div className="container story-grid">
            {otherPriests.map((priest) => (
              <article key={priest.id} className="story-card">
                <span className="story-card__tag">{priest.title}</span>
                <h2>{priest.name}</h2>
                <p>{priest.bio[0] ?? priest.motto}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
