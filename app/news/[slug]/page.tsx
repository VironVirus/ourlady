import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NewsStoryActions } from "@/components/news-story-actions";
import { PageIntro } from "@/components/page-intro";
import { SparkIcon } from "@/components/site-icons";
import { getNewsPostBySlug } from "@/lib/news";
import { churchPhotos } from "@/lib/site-media";

type NewsStoryPageProps = {
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

export async function generateMetadata({
  params
}: NewsStoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsPostBySlug(slug);

  if (!item) {
    return {
      title: "News Story"
    };
  }

  return {
    title: `${item.title} | Our Lady of Lourdes Catholic Church`,
    description: item.excerpt || item.description
  };
}

export default async function NewsStoryPage({ params }: NewsStoryPageProps) {
  const { slug } = await params;
  const item = await getNewsPostBySlug(slug);

  if (!item || !item.published) {
    notFound();
  }

  const paragraphs = toParagraphs(item.content || item.excerpt || item.description);

  return (
    <div className="page">
      <PageIntro
        eyebrow={item.label || "News"}
        title={item.title}
        description={item.excerpt || item.description}
        image={item.image || churchPhotos.processionStreet.src}
        position="center"
      />

      <section className="section">
        <div className="container story-article">
          <div className="story-article__main">
            <div className="story-card__meta">
              <span>{item.date}</span>
              <span>{item.location}</span>
            </div>

            <NewsStoryActions
              slug={item.slug}
              title={item.title}
              initialLikes={item.likes}
            />

            <div className="story-article__body">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <aside className="story-article__aside">
            <div className="panel panel--soft-stack">
              <span className="section-badge">
                <SparkIcon className="icon" />
                Parish News
              </span>
              <h2>Read and share</h2>
              <p>This story has its own public link, so it can be opened and shared directly.</p>
              <Link href="/news" className="text-link">
                Back to all news
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
