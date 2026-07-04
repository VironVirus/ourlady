import { PageIntro } from "@/components/page-intro";
import { ClockIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { churchPhotos } from "@/lib/site-media";

export default async function MassSchedulePage() {
  const content = await getSiteContent();

  return (
    <div className="page">
      <PageIntro
        eyebrow="Mass"
        title="Mass Schedule"
        description="Worship with us."
        image={churchPhotos.altarInterior.src}
        position={churchPhotos.altarInterior.position}
      />
      <section className="section">
        <div className="container schedule-grid">
          {content.massSchedule.map((item) => (
            <article key={item.id} className="schedule-card schedule-card--clean">
              <span className="schedule-card__icon">
                <ClockIcon className="icon" />
              </span>
              <span className="story-card__tag">{item.day}</span>
              <h2>{item.title}</h2>
              <strong>{item.time}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
