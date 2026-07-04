"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClockIcon,
  CrossIcon,
  DocumentIcon,
  GalleryIcon,
  MegaphoneIcon,
  PriestIcon,
  SparkIcon,
  UsersIcon
} from "@/components/site-icons";
import { adminSectionGroups } from "@/lib/admin-nav";

const sectionIcons = {
  "/admin": CrossIcon,
  "/admin/general": CrossIcon,
  "/admin/mass": ClockIcon,
  "/admin/announcements": MegaphoneIcon,
  "/admin/news": SparkIcon,
  "/admin/documents": DocumentIcon,
  "/admin/reflections": CrossIcon,
  "/admin/pastoral": UsersIcon,
  "/admin/priests": PriestIcon,
  "/admin/gallery": GalleryIcon
} as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-side-nav" aria-label="Admin sections">
      {adminSectionGroups.map((group) => (
        <div key={group.title} className="admin-side-group">
          <div className="admin-side-group__title">{group.title}</div>
          <div className="admin-side-group__links">
            {group.items.map((item) => {
              const Icon = sectionIcons[item.href];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={pathname === item.href ? "is-active" : undefined}
                >
                  <div className="admin-side-nav__label">
                    <Icon className="icon icon--tiny" />
                    <strong>{item.label}</strong>
                  </div>
                  <span>{item.meta}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
