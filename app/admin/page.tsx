import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { adminSectionGroups, type AdminSectionHref } from "@/lib/admin-nav";
import { readDocuments } from "@/lib/documents";
import { getSiteContent } from "@/lib/content";
import { readNewsPosts } from "@/lib/news";
import { isSupabaseConfigured } from "@/lib/supabase-admin";

type AdminPageProps = {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const [content, newsItems, documents] = await Promise.all([
    getSiteContent(),
    readNewsPosts(),
    readDocuments()
  ]);
  const supabaseEnabled = isSupabaseConfigured();

  const sectionCounts: Partial<Record<AdminSectionHref, string>> = {
    "/admin/general": "Home, history, contact",
    "/admin/mass": `${content.massSchedule.length} schedule items`,
    "/admin/pastoral": `${content.pastoralUnits.length} parish groups`,
    "/admin/associations": `${content.associations.length} associations`,
    "/admin/announcements": `${content.announcements.length} announcements`,
    "/admin/news": `${newsItems.length} stories`,
    "/admin/documents": `${documents.length} files`,
    "/admin/saints": `${content.saints.length} saints`,
    "/admin/prayers": `${content.prayers.length} prayers`,
    "/admin/reflections": `${content.reflections.length} reflections`,
    "/admin/priests": `${content.priests.length} priest profiles`,
    "/admin/gallery": `${content.gallery.length} gallery items`
  };

  const notice =
    params.saved === "1"
      ? { type: "success" as const, message: "Changes saved successfully." }
      : params.error === "storage"
        ? {
            type: "error" as const,
            message:
              "Connect Supabase before using the admin on Netlify so changes and uploads can be saved."
          }
      : params.error === "invalid"
        ? {
            type: "error" as const,
            message: "Something went wrong while saving. Please try again."
          }
        : undefined;

  return (
    <AdminShell
      title="Overview"
      description={
        supabaseEnabled
          ? "Choose a section to manage church content, stories, and uploads."
          : "Choose a section to manage church content. Supabase uploads will turn on when the keys are added."
      }
      notice={notice}
    >
      <div className="admin-overview-stack">
        {adminSectionGroups
          .filter((group) => group.items.some((item) => item.href !== "/admin"))
          .map((group) => (
            <section key={group.title} className="admin-overview-section">
              <div className="admin-overview-section__head">
                <div>
                  <div className="eyebrow">{group.title}</div>
                  <h2>{group.title}</h2>
                </div>
                <p>{group.description}</p>
              </div>
              <div className="admin-overview-grid">
                {group.items
                  .filter((item) => item.href !== "/admin")
                  .map((item) => (
                    <Link key={item.href} href={item.href} className="admin-overview-card">
                      <strong>{item.label}</strong>
                      <span>{sectionCounts[item.href] ?? item.meta}</span>
                    </Link>
                  ))}
              </div>
            </section>
          ))}
      </div>
    </AdminShell>
  );
}
