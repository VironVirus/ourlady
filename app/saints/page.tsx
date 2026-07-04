import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { CrossIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { getVisibleSaints } from "@/lib/site-runtime";
import { churchPhotos, photoBackground } from "@/lib/site-media";

export default async function SaintsPage() {
  const content = await getSiteContent();
  const saints = getVisibleSaints(content);

  return (
    <div className="page">
      <PageIntro
        eyebrow="Saints"
        title="Saint of the Day"
        description="Read short lives of the saints and share them with the parish family."
        image={churchPhotos.altarInterior.src}
        position={churchPhotos.altarInterior.position}
      />
      <section className="section">
        <div className="container story-grid">
          {saints.length === 0 ? (
            <div className="panel empty-state">
              <h2>Saint stories will appear here soon.</h2>
              <p>Saint stories can be scheduled from the admin area and will appear on their assigned day.</p>
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
