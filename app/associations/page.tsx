import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { UsersIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { churchPhotos } from "@/lib/site-media";

export default async function AssociationsPage() {
  const content = await getSiteContent();
  const cyon =
    content.associations.find((item) => item.slug === "cyon") ??
    content.associations[0] ??
    null;

  return (
    <div className="page">
      <PageIntro
        eyebrow="Groups"
        title="Groups"
        description="Associations and societies will be added soon, please stay tuned."
        image={churchPhotos.processionCourtyard.src}
        position={churchPhotos.processionCourtyard.position}
      />
      <section className="section">
        <div className="container">
          <article className="panel panel--soft-stack">
            <span className="section-badge">
              <UsersIcon className="icon" />
              CYON
            </span>
            <h2>Associations and societies will be added soon, please stay tuned.</h2>
            <p>The website is focused on CYON for now so the youth community stays simple and clear.</p>
            {cyon ? (
              <div className="story-card__meta">
                <span>{cyon.shortName}</span>
                <span>{cyon.meeting}</span>
              </div>
            ) : null}
            {cyon ? (
              <Link href={`/associations/${cyon.slug}`} className="button button--secondary">
                Visit CYON
              </Link>
            ) : null}
          </article>
        </div>
      </section>
    </div>
  );
}
