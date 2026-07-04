import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { CrossIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { getVisibleSaints } from "@/lib/site-runtime";
import { churchPhotos } from "@/lib/site-media";

type SaintPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function toParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((item) => item.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

export default async function SaintPage({ params }: SaintPageProps) {
  const content = await getSiteContent();
  const { slug } = await params;
  const item = getVisibleSaints(content).find((entry) => entry.slug === slug);

  if (!item) {
    notFound();
  }

  const story = toParagraphs(item.story);

  return (
    <div className="page">
      <PageIntro
        eyebrow="Saint of the Day"
        title={item.name}
        description={item.excerpt}
        image={item.image || churchPhotos.altarInterior.src}
        position="center"
      />
      <section className="section">
        <div className="container story-article">
          <div className="story-article__main">
            <div className="story-card__meta">
              <span>{item.feastDay}</span>
              <span>{item.title}</span>
            </div>
            <div className="story-article__body">
              {story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <aside className="story-article__aside">
            <div className="panel panel--soft-stack">
              <span className="section-badge">
                <CrossIcon className="icon" />
                Saint Story
              </span>
              <h2>Prayer and reflection</h2>
              <p>Saint stories can be scheduled from the admin area and featured on the homepage when their day arrives.</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
