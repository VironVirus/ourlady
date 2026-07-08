export const newsCategoryOptions = [
  "General",
  "Sports",
  "Pastoral",
  "Liturgy",
  "Youth",
  "Community",
  "Events"
] as const;

export function normalizeNewsCategory(value: string) {
  const trimmed = value.trim();
  const match = newsCategoryOptions.find(
    (item) => item.toLowerCase() === trimmed.toLowerCase()
  );

  return match ?? "General";
}
