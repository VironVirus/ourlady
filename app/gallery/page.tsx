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
          <h1>Parish Life in Pictures</h1>
          <p className="hero__lead hero__lead--light">Moments from worship and community life.</p>
        </div>
      </HeroSlideshow>

      <section className="section">
        <div className="container gallery-grid">
          {gallerySlides.map((photo, index) => {
            const item = content.gallery[index];

            return (
              <article
                key={photo.src}
                className={`gallery-card gallery-card--photo gallery-card--${item?.tone ?? "gold"}`}
                style={photoBackground(photo)}
              >
                <div className="gallery-card__content">
                  <span className="section-badge section-badge--light">
                    <GalleryIcon className="icon" />
                    {item?.period ?? "Parish"}
                  </span>
                  <h2>{item?.title ?? "Our Lady of Lourdes"}</h2>
                  <p>{item?.detail ?? ""}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
