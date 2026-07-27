"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookIcon,
  ClockIcon,
  CrossIcon,
  HomeIcon,
  SparkIcon
} from "@/components/site-icons";

const bottomLinks = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/mass-schedule", label: "Mass", icon: ClockIcon },
  { href: "/daily-readings", label: "Readings", icon: BookIcon },
  { href: "/news", label: "News", icon: SparkIcon },
  { href: "/prayers", label: "Prayers", icon: CrossIcon }
];

export function SiteBottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="site-bottom-nav" aria-label="Bottom navigation">
      {bottomLinks.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className={isActive ? "is-active" : undefined}
          >
            <Icon className="icon icon--tiny" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
