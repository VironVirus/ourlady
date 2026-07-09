import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { SiteBottomNav } from "@/components/site-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteContent } from "@/lib/content";
import { getLiturgicalDayInfo } from "@/lib/liturgical-calendar";
import { churchPhotos } from "@/lib/site-media";
import { getSiteUrl, toAbsoluteMediaUrl } from "@/lib/site-url";
import {
  getMassEntryForDate,
  getMassTimes,
  getSaintForDate,
  getSaintHref,
  getSiteDateKey,
  getRollingMassWeek,
  resolveThemePreset
} from "@/lib/site-runtime";
import { getThemePresetVariableSet } from "@/lib/theme-presets";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Our Lady of Lourdes Catholic Church, Maryland, Enugu",
  description: "Catholic parish website for Our Lady of Lourdes Catholic Church, Maryland, Enugu.",
  openGraph: {
    title: "Our Lady of Lourdes Catholic Church, Maryland, Enugu",
    description: "Catholic parish website for Our Lady of Lourdes Catholic Church, Maryland, Enugu.",
    url: siteUrl,
    siteName: "Our Lady of Lourdes Catholic Church",
    type: "website",
    images: [
      {
        url: toAbsoluteMediaUrl(churchPhotos.frontExterior.src),
        alt: churchPhotos.frontExterior.alt
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Lady of Lourdes Catholic Church, Maryland, Enugu",
    description: "Catholic parish website for Our Lady of Lourdes Catholic Church, Maryland, Enugu.",
    images: [toAbsoluteMediaUrl(churchPhotos.frontExterior.src)]
  }
};

function buildThemeStyle(preset: Parameters<typeof getThemePresetVariableSet>[0]) {
  const lightTheme = getThemePresetVariableSet(preset, "light");
  const darkTheme = getThemePresetVariableSet(preset, "dark");

  return {
    "--theme-background-light": lightTheme.background,
    "--theme-background-soft-light": lightTheme.backgroundSoft,
    "--theme-surface-light": lightTheme.surface,
    "--theme-surface-strong-light": lightTheme.surfaceStrong,
    "--theme-text-light": lightTheme.text,
    "--theme-muted-light": lightTheme.muted,
    "--theme-line-light": lightTheme.line,
    "--theme-brand-light": lightTheme.primary,
    "--theme-brand-deep-light": lightTheme.secondary,
    "--theme-brand-soft-light": lightTheme.accent,
    "--theme-shadow-light": lightTheme.shadow,
    "--theme-background-dark": darkTheme.background,
    "--theme-background-soft-dark": darkTheme.backgroundSoft,
    "--theme-surface-dark": darkTheme.surface,
    "--theme-surface-strong-dark": darkTheme.surfaceStrong,
    "--theme-text-dark": darkTheme.text,
    "--theme-muted-dark": darkTheme.muted,
    "--theme-line-dark": darkTheme.line,
    "--theme-brand-dark": darkTheme.primary,
    "--theme-brand-deep-dark": darkTheme.secondary,
    "--theme-brand-soft-dark": darkTheme.accent,
    "--theme-shadow-dark": darkTheme.shadow
  } as CSSProperties;
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dateKey = getSiteDateKey();
  const [content, liturgicalDay] = await Promise.all([
    getSiteContent(),
    getLiturgicalDayInfo(dateKey)
  ]);
  const activeSaint = getSaintForDate(content, dateKey, liturgicalDay?.saint?.name || "");
  const automaticSaint = liturgicalDay?.saint;
  const activeSaintHref = getSaintHref({
    content,
    dateKey,
    saint: activeSaint,
    automaticSaint: activeSaint ? null : automaticSaint ?? null
  });
  const nextMassEntry = getRollingMassWeek(content).find((entry) => entry.item);
  const nextMassDay = nextMassEntry?.item ?? null;
  const nextMassTimes = nextMassDay ? getMassTimes(nextMassDay).slice(0, 2).join(" · ") : "";
  const todayMassEntry = getMassEntryForDate(content, dateKey);
  const themeColor =
    todayMassEntry?.item?.liturgyColor || liturgicalDay?.color || "";
  const themePreset = resolveThemePreset(content, dateKey, themeColor);
  const massSummary =
    nextMassDay && nextMassTimes
      ? `${nextMassEntry?.labels.weekday || "Next Mass"} · ${nextMassTimes}`
      : "Mass times updated weekly";

  return (
    <html lang="en" data-appearance="system">
      <body style={buildThemeStyle(themePreset)}>
        <div className="site-shell">
          <SiteHeader
            activeSaint={
              activeSaint || automaticSaint
                ? {
                    name: activeSaint?.name || automaticSaint?.name || "",
                    href: activeSaintHref
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
