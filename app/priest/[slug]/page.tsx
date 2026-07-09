import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { PriestIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { churchPhotos } from "@/lib/site-media";
import { findPriestBySlug, getPriestSlug } from "@/lib/site-runtime";

type PriestPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getPriestParagraphs(bio: string[], motto: string) {
  const paragraphs = bio.filter(Boolean);

  return paragraphs.length > 0 ? paragraphs : [motto || "Catholic priest serving the parish family."];
}

export default async function PriestBioPage({ params }: PriestPageProps) {
  const content = await getSiteContent();
  const { slug } = await params;
  const priest = findPriestBySlug(content, slug);

  if (!priest) {
    notFound();
  }

  const otherPriests = content.priests.filter(
    (item, index) => getPriestSlug(item, index) !== slug
  );
  const paragraphs = getPriestParagraphs(priest.bio, priest.motto);

  return (
    <div className="page">
      <PageIntro
        eyebrow="Priest Bio"
        title={priest.name}
        description={priest.title || "Priest profile"}
        image={priest.image || churchPhotos.priest.src}
        position="center"
      />

      <section className="section">
        <div className="container story-article">
          <article className="story-article__main">
            <span className="section-badge">
              <PriestIcon className="icon" />
              {priest.title || "Priest Profile"}
            </span>
            <div className="story-card__meta">
              <span>Our Lady of Lourdes Catholic Church</span>
              <span>Maryland, Enugu</span>
            </div>
            <div className="story-article__body">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>

          <aside className="story-article__aside">
            <div className="panel panel--soft-stack">
              <span className="section-badge">
                <PriestIcon className="icon" />
                Motto
              </span>
              <h2>{priest.name}</h2>
              <p>{priest.motto || "Priestly service in prayer and pastoral care."}</p>
              <Link href="/priest" className="text-link">
                Back to priests
              </Link>
            </div>

            {otherPriests.length > 0 ? (
              <div className="panel panel--soft-stack">
                <span className="section-badge">
                  <PriestIcon className="icon" />
                  Other Priests
                </span>
                <div className="feed-stack">
                  {otherPriests.map((item) => (
                    <div key={item.id} className="feed-item">
                      <span>{item.title || "Priest"}</span>
                      <strong>{item.name}</strong>
                      <Link
                        href={`/priest/${getPriestSlug(item, content.priests.indexOf(item))}`}
                        className="text-link"
                      >
                        Read bio
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </div>
  );
}
