import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NewsSlideshow } from "@/components/news-slideshow";
import { NewsStoryActions } from "@/components/news-story-actions";
import { PageIntro } from "@/components/page-intro";
import { SparkIcon } from "@/components/site-icons";
import { getNewsImages, getPrimaryNewsImage } from "@/lib/news-images";
import { getNewsPostBySlug, getPublishedNewsPosts } from "@/lib/news";
import { siteIdentity } from "@/lib/site-identity";
import { toAbsoluteMediaUrl, toAbsoluteSiteUrl } from "@/lib/site-url";

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

  const description = item.excerpt || item.description;
  const primaryImage = toAbsoluteMediaUrl(getPrimaryNewsImage(item));
  const storyUrl = toAbsoluteSiteUrl(`/news/${item.slug}`);

  return {
    title: `${item.title} | ${siteIdentity.shortName}`,
    description,
    alternates: {
      canonical: storyUrl
    },
    openGraph: {
      title: item.title,
      description,
      url: storyUrl,
      siteName: siteIdentity.shortName,
      type: "article",
      images: primaryImage
        ? [
            {
              url: primaryImage,
              alt: item.title
            }
          ]
        : undefined
    },
    twitter: {
      card: primaryImage ? "summary_large_image" : "summary",
      title: item.title,
      description,
      images: primaryImage ? [primaryImage] : undefined
    }
  };
}

export default async function NewsStoryPage({ params }: NewsStoryPageProps) {
  const { slug } = await params;
  const [item, newsItems] = await Promise.all([
    getNewsPostBySlug(slug),
    getPublishedNewsPosts()
  ]);

  if (!item || !item.published) {
    notFound();
  }

  const paragraphs = toParagraphs(item.content || item.excerpt || item.description);
  const storyImages = getNewsImages(item);
  const primaryImage = getPrimaryNewsImage(item);
  const relatedStories = newsItems
    .filter((entry) => entry.slug !== item.slug && entry.label === item.label)
    .slice(0, 3);

  return (
    <div className="page">
      <PageIntro
        eyebrow={item.label || "News"}
        title={item.title}
        description={item.excerpt || item.description}
        image={primaryImage || undefined}
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

            {storyImages.length > 0 ? (
              <NewsSlideshow
                className="story-article__gallery"
                images={storyImages}
                fit="contain"
                overlay="linear-gradient(180deg, rgba(17, 12, 9, 0.06), rgba(17, 12, 9, 0.28))"
              />
            ) : null}

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
                {item.label}
              </span>
              <h2>Read and share</h2>
              <p>Share this story with family and friends.</p>
              <Link href="/news" className="text-link">
                Back to all news
              </Link>
            </div>
            {relatedStories.length > 0 ? (
              <div className="panel panel--soft-stack">
                <h2>Related stories</h2>
                {relatedStories.map((story) => (
                  <div key={story.id} className="feed-item">
                    <span>{story.label}</span>
                    <strong>{story.title}</strong>
                    <small>{story.date}</small>
                    <Link href={`/news/${story.slug}`} className="text-link">
                      Open story
                    </Link>
                  </div>
                ))}
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </div>
  );
}
