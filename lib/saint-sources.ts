import { getMassDateLabel } from "@/lib/site-runtime";

export type SaintSourceLink = {
  label: string;
  href: string;
  note: string;
};

function toSearchQuery(name: string) {
  return encodeURIComponent(name.trim());
}

export function getSaintSourceLinks(name: string, dateKey: string): SaintSourceLink[] {
  const longDate = getMassDateLabel(dateKey).longDate;
  const query = toSearchQuery(name);

  return [
    {
      label: "Franciscan Media",
      href: `https://www.franciscanmedia.org/?s=${query}`,
      note: `Search Catholic saint stories for ${name}.`
    },
    {
      label: "CatholicSaints.Info",
      href: `https://catholicsaints.info/?s=${query}`,
      note: `Open saint profiles and feast references for ${name}.`
    },
    {
      label: "Vatican News",
      href: "https://www.vaticannews.va/en/saints.html",
      note: `See the Vatican News saint calendar for ${longDate}.`
    }
  ];
}
