type AdminSectionHref =
  | "/admin"
  | "/admin/general"
  | "/admin/mass"
  | "/admin/announcements"
  | "/admin/news"
  | "/admin/documents"
  | "/admin/associations"
  | "/admin/saints"
  | "/admin/prayers"
  | "/admin/reflections"
  | "/admin/pastoral"
  | "/admin/priests"
  | "/admin/gallery";

type AdminSection = {
  href: AdminSectionHref;
  label: string;
  meta: string;
};

type AdminSectionGroup = {
  title: string;
  description: string;
  items: readonly AdminSection[];
};

export const adminSectionGroups: readonly AdminSectionGroup[] = [
  {
    title: "Start",
    description: "Overview and quick access",
    items: [
      {
        href: "/admin",
        label: "Overview",
        meta: "Quick access"
      }
    ]
  },
  {
    title: "Chaplaincy Setup",
    description: "Core chaplaincy pages and worship information",
    items: [
      {
        href: "/admin/general",
        label: "General",
        meta: "Home, history, contact"
      },
      {
        href: "/admin/mass",
        label: "Mass Scheduling",
        meta: "Times and liturgy"
      },
      {
        href: "/admin/pastoral",
        label: "Student Life",
        meta: "Departments and units"
      }
    ]
  },
  {
    title: "Updates",
    description: "Fresh content for the chaplaincy community",
    items: [
      {
        href: "/admin/announcements",
        label: "Announcements",
        meta: "Chaplaincy notices"
      },
      {
        href: "/admin/news",
        label: "News",
        meta: "News and images"
      },
      {
        href: "/admin/documents",
        label: "Documents",
        meta: "Bulletins and events"
      },
      {
        href: "/admin/saints",
        label: "Saints",
        meta: "Saint of the day"
      },
      {
        href: "/admin/prayers",
        label: "Prayers",
        meta: "Prayer texts and write-ups"
      },
      {
        href: "/admin/reflections",
        label: "Reflections",
        meta: "Faith writing"
      }
    ]
  },
  {
    title: "People & Media",
    description: "Profiles and chaplaincy photo content",
    items: [
      {
        href: "/admin/priests",
        label: "Priests",
        meta: "Add or remove priests"
      },
      {
        href: "/admin/gallery",
        label: "Gallery",
        meta: "Photos and captions"
      }
    ]
  }
] as const;

export const adminSections: readonly AdminSection[] = adminSectionGroups.flatMap(
  (group) => group.items
);

export type { AdminSectionHref };
