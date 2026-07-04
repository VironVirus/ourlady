import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { SiteBottomNav } from "@/components/site-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteContent } from "@/lib/content";
import { getActiveSaint, resolveThemeSettings } from "@/lib/site-runtime";

export const metadata: Metadata = {
  title: "Our Lady of Lourdes Catholic Church, Maryland, Enugu",
  description:
    "A modern parish website for Our Lady of Lourdes Catholic Church, Maryland, Enugu with church updates, news, blogs, and ministry dashboards."
};

function buildThemeStyle(theme: Awaited<ReturnType<typeof getSiteContent>>["theme"]) {
  return {
    "--background": theme.background,
    "--background-soft": theme.backgroundSoft,
    "--brand": theme.primary,
    "--brand-deep": theme.secondary,
    "--brand-soft": theme.accent
  } as CSSProperties;
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();
  const activeSaint = getActiveSaint(content);
  const sundayTimes = content.massSchedule
    .filter((item) => item.day.toLowerCase().includes("sunday"))
    .map((item) => item.time)
    .slice(0, 2)
    .join(" · ");
  const massSummary = sundayTimes ? `Sunday · ${sundayTimes}` : "Mass times updated weekly";

  return (
    <html lang="en">
      <body style={buildThemeStyle(resolveThemeSettings(content))}>
        <div className="site-shell">
          <SiteHeader
            activeSaint={
              activeSaint
                ? {
                    name: activeSaint.name,
                    slug: activeSaint.slug
                  }
                : undefined
            }
            associations={content.associations.map((item) => ({
              slug: item.slug,
              shortName: item.shortName,
              name: item.name
            }))}
          />
          <main>{children}</main>
          <SiteFooter massSummary={massSummary} town={content.contact.town || "Maryland, Enugu"} />
          <SiteBottomNav />
        </div>
      </body>
    </html>
  );
}
