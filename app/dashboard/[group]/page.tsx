import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { getSiteContent } from "@/lib/content";
import { churchPhotos } from "@/lib/site-media";

type DashboardGroupPageProps = {
  params: Promise<{
    group: string;
  }>;
};

export default async function DashboardGroupPage({
  params
}: DashboardGroupPageProps) {
  const content = await getSiteContent();
  const { group } = await params;
  const unit = content.pastoralUnits.find((item) => item.slug === group);

  if (!unit) {
    notFound();
  }

  return (
    <div className="page">
      <PageIntro
        eyebrow="Pastoral"
        title={unit.name}
        description={unit.description}
        image={churchPhotos.processionCourtyard.src}
        position={churchPhotos.processionCourtyard.position}
      />
      <section className="section">
        <div className="container split-grid">
          <article className="panel panel--soft-stack">
            <h2>{unit.name}</h2>
            <p>{unit.description}</p>
          </article>
          <article className="panel panel--soft-stack">
            <h2>{unit.lead}</h2>
            <div className="chip-row">
              {unit.focus.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
