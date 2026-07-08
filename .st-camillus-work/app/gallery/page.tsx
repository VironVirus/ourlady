import { HeroSlideshow } from "@/components/hero-slideshow";
import { GalleryIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { gallerySlides, photoBackground } from "@/lib/site-media";

export default async function GalleryPage() {
  const content = await getSiteContent();

  return (
    <div className="page">
      <HeroSlideshow slides={gallerySlides}>
        <div className="hero__panel hero__panel--compact">
          <div className="eyebrow eyebrow--light">Gallery</div>
          <h1>Chaplaincy Life in Pictures</h1>
          <p className="hero__lead hero__lead--light">Moments from worship, study, service, and student community life.</p>
        </div>
      </HeroSlideshow>

      <section className="section">
        <div className="container gallery-grid">
          {content.gallery.length > 0 ? (
            content.gallery.map((item, index) => {
              const photo = gallerySlides[index % gallerySlides.length];

              return (
                <article
                  key={item.id}
                  className={`gallery-card gallery-card--photo gallery-card--${item.tone}`}
                  style={photoBackground(photo)}
                >
                  <div className="gallery-card__content">
                    <span className="section-badge section-badge--light">
                      <GalleryIcon className="icon" />
                      {item.period}
                    </span>
                    <h2>{item.title}</h2>
                    <p>{item.detail}</p>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="panel empty-state">
              <h2>No gallery items yet.</h2>
              <p>Real gallery captions and highlights can be added later.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
