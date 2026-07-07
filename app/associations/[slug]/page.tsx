import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { UsersIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { churchPhotos } from "@/lib/site-media";

type AssociationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function AssociationPage({ params }: AssociationPageProps) {
  const content = await getSiteContent();
  const { slug } = await params;
  const item = content.associations.find((entry) => entry.slug === slug);

  if (!item) {
    notFound();
  }

  return (
    <div className="page">
      <PageIntro
        eyebrow="CYON"
        title={item.name}
        description={item.description}
        image={item.image || churchPhotos.processionCourtyard.src}
        position="center"
      />
      <section className="section">
        <div className="container split-grid">
          <article className="panel panel--soft-stack">
            <span className="section-badge">
              <UsersIcon className="icon" />
              {item.shortName}
            </span>
            <h2>{item.lead}</h2>
            <p>{item.meeting}</p>
          </article>
          <article className="panel panel--soft-stack">
            <h2>What this association focuses on</h2>
            <div className="chip-row">
              {item.focus.map((focus) => (
                <span key={focus} className="chip">
                  {focus}
                </span>
              ))}
            </div>
            <p>Other associations and societies will be added later. For now, CYON is the active group on the website.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
