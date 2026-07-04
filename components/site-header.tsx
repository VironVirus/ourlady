"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDownIcon,
  CrossIcon,
  DocumentIcon,
  GalleryIcon,
  MegaphoneIcon,
  MenuIcon,
  PriestIcon,
  SparkIcon,
  UsersIcon
} from "@/components/site-icons";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/mass-schedule", label: "Mass" }
];

const groupedNavigation = [
  {
    label: "Parish",
    items: [
      { href: "/about", label: "About", icon: CrossIcon },
      { href: "/priest", label: "Priests", icon: PriestIcon },
      { href: "/pastoral", label: "Pastoral", icon: UsersIcon },
      { href: "/contact", label: "Contact", icon: CrossIcon }
    ]
  },
  {
    label: "Updates",
    items: [
      { href: "/announcements", label: "Announcements", icon: MegaphoneIcon },
      { href: "/news", label: "News", icon: SparkIcon },
      { href: "/documents", label: "Bulletins", icon: DocumentIcon },
      { href: "/reflections", label: "Reflections", icon: CrossIcon },
      { href: "/gallery", label: "Gallery", icon: GalleryIcon }
    ]
  }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isGroupActive = (hrefs: { href: string }[]) =>
    hrefs.some((item) => pathname === item.href);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="brand-mark" onClick={() => setMobileOpen(false)}>
          <span className="brand-mark__seal">OL</span>
          <span className="brand-mark__text">
            <strong>Our Lady of Lourdes</strong>
            <small>Maryland, Enugu</small>
          </span>
        </Link>

        <div className="site-header__controls">
          <nav className="site-nav site-nav--desktop" aria-label="Primary navigation">
            {primaryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? "is-active" : undefined}
              >
                {item.label}
              </Link>
            ))}

            {groupedNavigation.map((group) => (
              <div key={group.label} className="desktop-dropdown">
                <button
                  type="button"
                  className={`desktop-dropdown__trigger${
                    isGroupActive(group.items) ? " is-active" : ""
                  }`}
                >
                  {group.label}
                  <ChevronDownIcon className="icon icon--tiny" />
                </button>
                <div className="desktop-dropdown__menu">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={pathname === item.href ? "is-active" : undefined}
                      >
                        <Icon className="icon icon--tiny" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <Link
              href="/admin"
              className={`site-nav__admin${pathname.startsWith("/admin") ? " is-active" : ""}`}
            >
              Admin
            </Link>
          </nav>

          <button
            type="button"
            className={`mobile-menu-button${mobileOpen ? " is-active" : ""}`}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((current) => !current)}
          >
            {mobileOpen ? <CrossIcon className="icon" /> : <MenuIcon className="icon" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="site-mobile-menu">
          <div className="container site-mobile-menu__inner">
            <div className="site-mobile-menu__top">
              {primaryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={pathname === item.href ? "is-active" : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {groupedNavigation.map((group) => (
              <div key={group.label} className="site-mobile-menu__group">
                <span>{group.label}</span>
                <div className="site-mobile-menu__links">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={pathname === item.href ? "is-active" : undefined}
                        onClick={() => setMobileOpen(false)}
                      >
                        <Icon className="icon icon--tiny" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <Link
              href="/admin"
              className={`site-mobile-menu__admin${pathname.startsWith("/admin") ? " is-active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
