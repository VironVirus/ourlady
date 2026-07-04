import { notFound } from "next/navigation";
import { AdminDocumentManager } from "@/components/admin-document-manager";
import { AdminNewsManager } from "@/components/admin-news-manager";
import { AdminSectionEditor } from "@/components/admin-section-editor";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { readDocuments } from "@/lib/documents";
import { getSiteContent } from "@/lib/content";
import { readNewsPosts } from "@/lib/news";
import { isSupabaseConfigured } from "@/lib/supabase-admin";

const sectionConfig = {
  general: {
    title: "General",
    description: "Update homepage text, parish story, and contact details.",
    editorSection: "general"
  },
  mass: {
    title: "Mass Scheduling",
    description: "Manage Mass times, confessions, and liturgy schedule items.",
    editorSection: "mass"
  },
  announcements: {
    title: "Announcements",
    description: "Manage urgent parish notices and reminders.",
    editorSection: "announcements"
  },
  news: {
    title: "News",
    description: "Manage full stories, preview cards, links, likes, and images."
  },
  documents: {
    title: "Documents",
    description: "Manage bulletins and special event files from one library."
  },
  reflections: {
    title: "Reflections",
    description: "Manage reflections, faith notes, and pastoral writing.",
    editorSection: "reflections"
  },
  pastoral: {
    title: "Pastoral Organisation",
    description: "Organize groups, ministries, and parish units.",
    editorSection: "pastoral"
  },
  priests: {
    title: "Priests",
    description: "Add, remove, and update priest profiles.",
    editorSection: "priests"
  },
  gallery: {
    title: "Gallery",
    description: "Manage gallery labels, captions, and display items.",
    editorSection: "gallery"
  }
} as const;

type AdminSectionPageProps = {
  params: Promise<{
    section: string;
  }>;
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

export default async function AdminSectionPage({
  params,
  searchParams
}: AdminSectionPageProps) {
  await requireAdmin();
  const { section } = await params;
  const config = sectionConfig[section as keyof typeof sectionConfig];

  if (!config) {
    notFound();
  }

  const query = await searchParams;
  const uploadsEnabled = isSupabaseConfigured();
  const notice =
    query.saved === "1"
      ? { type: "success" as const, message: "Changes saved successfully." }
      : query.error === "storage"
        ? {
            type: "error" as const,
            message:
              "Connect Supabase before using the admin on Netlify so changes and uploads can be saved."
          }
      : query.error === "invalid"
        ? {
            type: "error" as const,
            message: "Something went wrong while saving. Please try again."
          }
        : undefined;

  if (section === "news") {
    const newsItems = await readNewsPosts();

    return (
      <AdminShell
        title={config.title}
        description={config.description}
        notice={notice}
      >
        <AdminNewsManager initialItems={newsItems} uploadsEnabled={uploadsEnabled} />
      </AdminShell>
    );
  }

  if (section === "documents") {
    const documents = await readDocuments();

    return (
      <AdminShell
        title={config.title}
        description={config.description}
        notice={notice}
      >
        <AdminDocumentManager initialItems={documents} uploadsEnabled={uploadsEnabled} />
      </AdminShell>
    );
  }

  const content = await getSiteContent();

  return (
    <AdminShell
      title={config.title}
      description={config.description}
      notice={notice}
    >
      <AdminSectionEditor
        initialContent={content}
        section={section as Exclude<keyof typeof sectionConfig, "documents">}
        redirectTo={`/admin/${section}`}
        uploadsEnabled={uploadsEnabled}
      />
    </AdminShell>
  );
}
