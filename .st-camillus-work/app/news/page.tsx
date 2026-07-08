import { NewsBrowser } from "@/components/news-browser";
import { PageIntro } from "@/components/page-intro";
import { getPublishedNewsPosts } from "@/lib/news";
import { churchPhotos } from "@/lib/site-media";

export default async function NewsPage() {
  const newsItems = await getPublishedNewsPosts();

  return (
    <div className="page">
      <PageIntro
        eyebrow="News"
        title="Chaplaincy News"
        description="Stories, events, student activities, and chaplaincy updates."
        image={churchPhotos.processionStreet.src}
        position={churchPhotos.processionStreet.position}
      />
      <section className="section section--soft">
        <div className="container">
          <NewsBrowser items={newsItems} />
        </div>
      </section>
    </div>
  );
}
