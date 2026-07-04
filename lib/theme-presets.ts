export const themePresetKeys = [
  "gold",
  "white",
  "red",
  "green",
  "purple"
] as const;

export type ThemePresetKey = (typeof themePresetKeys)[number];

type ThemePalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundSoft: string;
};

const themePresetMap: Record<ThemePresetKey, ThemePalette> = {
  gold: {
    primary: "#9a7431",
    secondary: "#4a3219",
    accent: "#d9b86d",
    background: "#f5efe5",
    backgroundSoft: "#ece1cf"
  },
  white: {
    primary: "#b59b66",
    secondary: "#675949",
    accent: "#eee2c7",
    background: "#faf8f2",
    backgroundSoft: "#f1eadf"
  },
  red: {
    primary: "#9e2f2f",
    secondary: "#531919",
    accent: "#ddb6a8",
    background: "#f7ece9",
    backgroundSoft: "#eed8d2"
  },
  green: {
    primary: "#2f6f4a",
    secondary: "#183c2c",
    accent: "#9fc9af",
    background: "#edf5ef",
    backgroundSoft: "#dceade"
  },
  purple: {
    primary: "#6f4a8e",
    secondary: "#37204f",
    accent: "#c7b2df",
    background: "#f1edf7",
    backgroundSoft: "#e3d8f0"
  }
};

export const themePresetOptions = [
  { value: "gold", label: "Gold" },
  { value: "white", label: "White" },
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" }
] as const satisfies ReadonlyArray<{ value: ThemePresetKey; label: string }>;

export function isThemePresetKey(value: string): value is ThemePresetKey {
  return themePresetKeys.includes(value as ThemePresetKey);
}

export function getThemePresetPalette(
  preset: string,
  fallback: ThemePalette = themePresetMap.gold
) {
  return isThemePresetKey(preset) ? themePresetMap[preset] : fallback;
}
