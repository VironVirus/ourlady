import type { CSSProperties } from "react";

export type SitePhoto = {
  src: string;
  alt: string;
  position?: string;
};

export const churchPhotos = {
  frontExterior: {
    src: "/images/church/front-exterior.jpeg",
    alt: "Front view of the church building",
    position: "center 34%"
  },
  processionStreet: {
    src: "/images/church/procession-street.jpeg",
    alt: "Faith procession near the church grounds",
    position: "center 52%"
  },
  processionCourtyard: {
    src: "/images/church/procession-courtyard.jpeg",
    alt: "Community gathering in the church courtyard",
    position: "center 42%"
  },
  altarInterior: {
    src: "/images/church/altar-interior.jpeg",
    alt: "Interior altar view during worship",
    position: "center 38%"
  },
  priest: {
    src: "/images/priest/parish-priest.jpeg",
    alt: "Chaplaincy priest in liturgical vestment",
    position: "center 20%"
  }
} as const satisfies Record<string, SitePhoto>;

export const heroSlides = [
  churchPhotos.frontExterior,
  churchPhotos.processionStreet,
  churchPhotos.processionCourtyard,
  churchPhotos.altarInterior
];

export const gallerySlides = [
  churchPhotos.frontExterior,
  churchPhotos.priest,
  churchPhotos.processionStreet,
  churchPhotos.processionCourtyard,
  churchPhotos.altarInterior
];

export function photoBackground(
  photo: SitePhoto,
  overlay = "linear-gradient(180deg, rgba(26, 17, 10, 0.18), rgba(26, 17, 10, 0.76))"
): CSSProperties {
  return {
    backgroundImage: `${overlay}, url(${photo.src})`,
    backgroundPosition: photo.position ?? "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
  };
}
