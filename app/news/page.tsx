import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { SparkIcon } from "@/components/site-icons";
import { getPublishedNewsPosts } from "@/lib/news";
import { churchPhotos, gallerySlides, photoBackground } from "@/lib/site-media";

export default async function NewsPage() {
  const newsItems = await getPublishedNewsPosts();

  return (
    <div className="page">
      <PageIntro
        eyebrow="News"
        title="Parish News"
        description="Stories, gatherings, and parish updates."
        image={churchPhotos.processionStreet.src}
        position={churchPhotos.processionStreet.position}
      />
      <section className="section">
        <div className="container story-grid">
          {newsItems.length === 0 ? (
            <div className="panel empty-state">
              <h2>Parish news will appear here soon.</h2>
              <p>Recent stories, events, and community moments will be added from the admin area.</p>
            </div>
          ) : null}
          {newsItems.map((item, index) => (
            <article
              key={item.id}
              className="story-card story-card--photo"
              style={photoBackground(
                item.image
                  ? {
                      src: item.image,
                      alt: item.title || "Parish news image",
                      position: "center"
                    }
                  : gallerySlides[(index + 1) % gallerySlides.length]
              )}
            >
              <div className="story-card__content">
                <span className="section-badge section-badge--light">
                  <SparkIcon className="icon" />
                  {item.label}
                </span>
                <h2>{item.title}</h2>
                <p>{item.excerpt || item.description}</p>
                <div className="story-card__meta story-card__meta--light">
                  <span>{item.date}</span>
                  <span>{item.location}</span>
                </div>
                <Link href={`/news/${item.slug}`} className="button button--ghost">
                  Read Full Story
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
