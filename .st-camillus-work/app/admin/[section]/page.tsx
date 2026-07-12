import { notFound } from "next/navigation";
import { AdminAttendanceManager } from "@/components/admin-attendance-manager";
import { AdminConfessionManager } from "@/components/admin-confession-manager";
import { AdminDocumentManager } from "@/components/admin-document-manager";
import { AdminHymnManager } from "@/components/admin-hymn-manager";
import { AdminMissalManager } from "@/components/admin-missal-manager";
import { AdminNewsManager } from "@/components/admin-news-manager";
import { AdminSectionEditor } from "@/components/admin-section-editor";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import {
  readAttendanceRecords,
  readAttendanceRequests,
  readConfessionReservations,
  readConfessionSchedules,
  readHymnPlans,
  readMissalEntries
} from "@/lib/community-modules";
import { readDocuments } from "@/lib/documents";
import { getSiteContent } from "@/lib/content";
import { readNewsPosts } from "@/lib/news";
import { getSiteUrl } from "@/lib/site-url";
import { isSupabaseConfigured } from "@/lib/supabase-admin";

const sectionConfig = {
  general: {
    title: "General",
    description: "Update homepage text, chaplaincy story, and contact details.",
    editorSection: "general"
  },
  mass: {
    title: "Mass Scheduling",
    description: "Manage weekly chaplaincy times, confessions, and liturgy schedule items.",
    editorSection: "mass"
  },
  attendance: {
    title: "Attendance",
    description: "Create a QR check-in for each Mass and track who attended."
  },
  confession: {
    title: "Confession",
    description: "Create confession schedules, time slots, and printable attendance lists."
  },
  missal: {
    title: "Missal",
    description: "Prepare Order of Mass and daily prayer content in English, Igbo, and Latin."
  },
  hymns: {
    title: "Choir Hymns",
    description: "Add hymn lyrics for each Mass so the congregation can follow along."
  },
  associations: {
    title: "Associations",
    description: "Manage optional association pages if the chaplaincy ever needs them.",
    editorSection: "associations"
  },
  announcements: {
    title: "Announcements",
    description: "Manage urgent chaplaincy notices and reminders.",
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
  saints: {
    title: "Saints",
    description: "Manage saint stories and the Saint of the Day section.",
    editorSection: "saints"
  },
  prayers: {
    title: "Prayers",
    description: "Manage prayer write-ups that students can read on the website.",
    editorSection: "prayers"
  },
  reflections: {
    title: "Reflections",
    description: "Manage reflections, faith notes, and pastoral writing.",
    editorSection: "reflections"
  },
  pastoral: {
    title: "Student Life",
    description: "Organize departments, ministries, and chaplaincy units.",
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

  if (section === "attendance") {
    const [requests, records] = await Promise.all([
      readAttendanceRequests(),
      readAttendanceRecords()
    ]);

    return (
      <AdminShell
        title={config.title}
        description={config.description}
        notice={notice}
      >
        <AdminAttendanceManager
          initialRequests={requests}
          initialRecords={records}
          siteUrl={getSiteUrl()}
        />
      </AdminShell>
    );
  }

  if (section === "confession") {
    const [schedules, reservations] = await Promise.all([
      readConfessionSchedules(),
      readConfessionReservations()
    ]);

    return (
      <AdminShell
        title={config.title}
        description={config.description}
        notice={notice}
      >
        <AdminConfessionManager
          initialSchedules={schedules}
          initialReservations={reservations}
        />
      </AdminShell>
    );
  }

  if (section === "missal") {
    const entries = await readMissalEntries();

    return (
      <AdminShell
        title={config.title}
        description={config.description}
        notice={notice}
      >
        <AdminMissalManager initialEntries={entries} />
      </AdminShell>
    );
  }

  if (section === "hymns") {
    const hymnPlans = await readHymnPlans();

    return (
      <AdminShell
        title={config.title}
        description={config.description}
        notice={notice}
      >
        <AdminHymnManager initialPlans={hymnPlans} />
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
        section={
          section as
            | "general"
            | "mass"
            | "associations"
            | "announcements"
            | "saints"
            | "prayers"
            | "reflections"
            | "pastoral"
            | "priests"
            | "gallery"
        }
        redirectTo={`/admin/${section}`}
        uploadsEnabled={uploadsEnabled}
      />
    </AdminShell>
  );
}
