type NewsImageSource = {
  image?: unknown;
  images?: unknown;
};

function dedupe(values: string[]) {
  return Array.from(new Set(values));
}

export function normalizeNewsImageList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return dedupe(
      value
        .flatMap((item) => normalizeNewsImageList(item))
        .filter(Boolean)
    );
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[")) {
    try {
      return normalizeNewsImageList(JSON.parse(trimmed));
    } catch {
      return [];
    }
  }

  return [trimmed];
}

export function collectNewsImages(...values: unknown[]) {
  return dedupe(
    values.flatMap((value) => normalizeNewsImageList(value)).filter(Boolean)
  );
}

export function getNewsImages(source: NewsImageSource) {
  return collectNewsImages(source.images, source.image);
}

export function getPrimaryNewsImage(source: NewsImageSource) {
  return getNewsImages(source)[0] ?? "";
}

export function encodeNewsImages(images: string[]) {
  if (images.length === 0) {
    return null;
  }

  return images.length === 1 ? images[0] : JSON.stringify(images);
}
