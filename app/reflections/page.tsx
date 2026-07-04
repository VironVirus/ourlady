import { PageIntro } from "@/components/page-intro";
import { CrossIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { churchPhotos, photoBackground } from "@/lib/site-media";

const reflectionPhotos = [
  churchPhotos.altarInterior,
  churchPhotos.priest,
  churchPhotos.processionCourtyard
];

export default async function ReflectionsPage() {
  const content = await getSiteContent();

  return (
    <div className="page">
      <PageIntro
        eyebrow="Reflections"
        title="Parish Reflections"
        description="Simple faith notes from parish life."
        image={churchPhotos.altarInterior.src}
        position={churchPhotos.altarInterior.position}
      />
      <section className="section">
        <div className="container story-grid">
          {content.reflections.length > 0 ? (
            content.reflections.map((post, index) => (
              <article
                key={post.id}
                className="story-card story-card--photo"
                style={photoBackground(reflectionPhotos[index % reflectionPhotos.length])}
              >
                <div className="story-card__content">
                  <span className="section-badge section-badge--light">
                    <CrossIcon className="icon" />
                    {post.category}
                  </span>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <div className="story-card__meta story-card__meta--light">
                    <span>{post.date}</span>
                    <span>{post.author}</span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="panel empty-state">
              <h2>No reflections yet.</h2>
              <p>Reflections can be added later when real parish content is ready.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
