import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { PriestIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { churchPhotos } from "@/lib/site-media";
import { getPriestSlug } from "@/lib/site-runtime";

function getPriestPreview(priest: { motto: string; bio: string[] }) {
  return priest.bio.find(Boolean) || priest.motto || "Catholic priest serving the parish family.";
}

export default async function PriestPage() {
  const content = await getSiteContent();
  const [leadPriest] = content.priests;

  return (
    <div className="page">
      <PageIntro
        eyebrow="Priests"
        title="Parish Priests"
        description="Clergy serving the parish."
        image={churchPhotos.priest.src}
        position={churchPhotos.priest.position}
      />
      <section className="section">
        <div className="container story-article">
          {content.priests.length > 0 ? (
            <>
              <article className="story-article__main">
                <div className="section-badge">
                  <PriestIcon className="icon" />
                  Clergy Directory
                </div>
                <div className="priests-directory">
                  {content.priests.map((priest, index) => (
                    <article key={priest.id} className="priest-directory-item">
                      <div className="priest-directory-item__body">
                        <span>{priest.title || "Priest"}</span>
                        <h2>{priest.name}</h2>
                        <p>{getPriestPreview(priest)}</p>
                      </div>
                      <Link
                        href={`/priest/${getPriestSlug(priest, index)}`}
                        className="button button--secondary"
                      >
                        View bio
                      </Link>
                    </article>
                  ))}
                </div>
              </article>

              {leadPriest ? (
                <aside className="story-article__aside">
                  <div className="panel panel--soft-stack priest-card">
                    <div className="priest-card__seal">OL</div>
                    <span className="section-badge">
                      <PriestIcon className="icon" />
                      Featured Priest
                    </span>
                    <h2>{leadPriest.name}</h2>
                    <p>{leadPriest.title || "Serving the parish family."}</p>
                    <p>{getPriestPreview(leadPriest)}</p>
                    <Link
                      href={`/priest/${getPriestSlug(leadPriest, 0)}`}
                      className="button button--secondary"
                    >
                      Read full bio
                    </Link>
                  </div>
                </aside>
              ) : null}
            </>
          ) : (
            <div className="story-article__main">
              <div className="panel empty-state">
                <h2>No priest profiles yet.</h2>
                <p>Priest information can be added later from the admin area.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
