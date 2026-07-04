import { PageIntro } from "@/components/page-intro";
import { PriestIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { churchPhotos, photoBackground } from "@/lib/site-media";

export default async function PastoralPage() {
  const content = await getSiteContent();

  return (
    <div className="page">
      <PageIntro
        eyebrow="Pastoral"
        title="Pastoral Organisation"
        description="Parish groups and ministry life."
        image={churchPhotos.processionCourtyard.src}
        position={churchPhotos.processionCourtyard.position}
      />
      <section className="section">
        <div className="container dashboard-grid">
          {content.pastoralUnits.map((unit, index) => (
            <article
              key={unit.slug}
              className={`dashboard-card${index === 0 ? " dashboard-card--photo" : ""}`}
              style={
                index === 0 ? photoBackground(churchPhotos.processionCourtyard) : undefined
              }
            >
              <div className={index === 0 ? "dashboard-card__overlay" : undefined}>
                <span className={index === 0 ? "section-badge section-badge--light" : "section-badge"}>
                  <PriestIcon className="icon" />
                  {unit.shortName}
                </span>
                <h2>{unit.name}</h2>
                <p>{unit.description}</p>
                <ul>
                  {unit.focus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
