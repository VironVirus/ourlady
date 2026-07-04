import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { UsersIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { churchPhotos, photoBackground } from "@/lib/site-media";

export default async function AssociationsPage() {
  const content = await getSiteContent();

  return (
    <div className="page">
      <PageIntro
        eyebrow="Associations"
        title="Parish Associations"
        description="Connect directly with the associations and groups that shape parish life."
        image={churchPhotos.processionCourtyard.src}
        position={churchPhotos.processionCourtyard.position}
      />
      <section className="section">
        <div className="container association-grid">
          {content.associations.map((item, index) => (
            <article
              key={item.slug}
              className={`association-card${item.image ? " association-card--photo" : ""}`}
              style={
                item.image
                  ? {
                      backgroundImage: `linear-gradient(180deg, rgba(17, 12, 9, 0.16), rgba(17, 12, 9, 0.72)), url(${item.image})`,
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "cover"
                    }
                  : index === 0
                    ? photoBackground(churchPhotos.processionCourtyard)
                    : undefined
              }
            >
              <div className={item.image || index === 0 ? "association-card__content association-card__content--light" : "association-card__content"}>
                <span className={item.image || index === 0 ? "section-badge section-badge--light" : "section-badge"}>
                  <UsersIcon className="icon" />
                  {item.shortName}
                </span>
                <h2>{item.name}</h2>
                <p>{item.description}</p>
                <div className={item.image || index === 0 ? "story-card__meta story-card__meta--light" : "story-card__meta"}>
                  <span>{item.lead}</span>
                  <span>{item.meeting}</span>
                </div>
                <Link
                  href={`/associations/${item.slug}`}
                  className={item.image || index === 0 ? "button button--ghost" : "text-link"}
                >
                  Open association
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
