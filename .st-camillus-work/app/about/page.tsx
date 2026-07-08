import { PageIntro } from "@/components/page-intro";
import { CrossIcon, SparkIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { churchPhotos, photoBackground } from "@/lib/site-media";

export default async function AboutPage() {
  const content = await getSiteContent();

  return (
    <div className="page">
      <PageIntro
        eyebrow="About"
        title={content.parishHistory.heading}
        description={content.parishHistory.summary}
        image={churchPhotos.frontExterior.src}
        position={churchPhotos.frontExterior.position}
      />
      <section className="section">
        <div className="container split-grid">
          <article
            className="photo-card photo-card--medium"
            style={photoBackground(churchPhotos.processionCourtyard)}
          >
            <div className="photo-card__content">
              <div className="eyebrow eyebrow--light">Student Life</div>
              <h2>Faith in Formation</h2>
            </div>
          </article>

          <article className="panel panel--soft-stack">
            <div className="section-badge">
              <CrossIcon className="icon" />
              Our Story
            </div>
            {content.parishHistory.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="chip-row">
              {content.parishHistory.milestones.map((item) => (
                <span key={item} className="chip">
                  <SparkIcon className="icon icon--tiny" />
                  {item}
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
