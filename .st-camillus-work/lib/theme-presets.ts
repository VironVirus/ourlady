export const themePresetKeys = ["gold", "white", "red", "green", "purple"] as const;

export type ThemePresetKey = (typeof themePresetKeys)[number];
export type ThemeAppearance = "light" | "dark";

export type ThemePalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundSoft: string;
};

export type ThemeVariableSet = ThemePalette & {
  surface: string;
  surfaceStrong: string;
  text: string;
  muted: string;
  line: string;
  shadow: string;
};

const themeVariableMap: Record<
  ThemePresetKey,
  {
    light: ThemeVariableSet;
    dark: ThemeVariableSet;
  }
> = {
  gold: {
    light: {
      primary: "#bf8c31",
      secondary: "#12353c",
      accent: "#ead3a2",
      background: "#f7f7f2",
      backgroundSoft: "#e8eeeb",
      surface: "rgba(255, 255, 255, 0.84)",
      surfaceStrong: "#ffffff",
      text: "#112825",
      muted: "#5e7470",
      line: "rgba(18, 53, 60, 0.11)",
      shadow: "0 30px 80px rgba(11, 39, 43, 0.1)"
    },
    dark: {
      primary: "#f0c873",
      secondary: "#eef8f6",
      accent: "#8a6321",
      background: "#081618",
      backgroundSoft: "#0f1f21",
      surface: "rgba(11, 24, 26, 0.82)",
      surfaceStrong: "#11282b",
      text: "#edf7f6",
      muted: "#bfd4d0",
      line: "rgba(237, 247, 246, 0.12)",
      shadow: "0 30px 80px rgba(0, 0, 0, 0.4)"
    }
  },
  white: {
    light: {
      primary: "#7b8c8a",
      secondary: "#11353c",
      accent: "#d7e2df",
      background: "#f6f8f8",
      backgroundSoft: "#e7eded",
      surface: "rgba(255, 255, 255, 0.86)",
      surfaceStrong: "#ffffff",
      text: "#132826",
      muted: "#5d7371",
      line: "rgba(17, 53, 60, 0.1)",
      shadow: "0 30px 80px rgba(14, 38, 43, 0.09)"
    },
    dark: {
      primary: "#dbe7e4",
      secondary: "#f8fffe",
      accent: "#6f8481",
      background: "#091517",
      backgroundSoft: "#101e21",
      surface: "rgba(12, 25, 27, 0.84)",
      surfaceStrong: "#14282b",
      text: "#f1f9f8",
      muted: "#c6d9d6",
      line: "rgba(241, 249, 248, 0.12)",
      shadow: "0 30px 80px rgba(0, 0, 0, 0.38)"
    }
  },
  red: {
    light: {
      primary: "#b94759",
      secondary: "#12353c",
      accent: "#f0bec8",
      background: "#faf5f6",
      backgroundSoft: "#ece4e8",
      surface: "rgba(255, 255, 255, 0.86)",
      surfaceStrong: "#ffffff",
      text: "#182826",
      muted: "#6d666b",
      line: "rgba(44, 34, 40, 0.1)",
      shadow: "0 30px 80px rgba(36, 30, 33, 0.1)"
    },
    dark: {
      primary: "#f095a5",
      secondary: "#eef8f7",
      accent: "#903648",
      background: "#0a1416",
      backgroundSoft: "#111d20",
      surface: "rgba(14, 25, 27, 0.84)",
      surfaceStrong: "#172b2e",
      text: "#eff9f8",
      muted: "#d6c4cb",
      line: "rgba(239, 249, 248, 0.12)",
      shadow: "0 30px 80px rgba(0, 0, 0, 0.4)"
    }
  },
  green: {
    light: {
      primary: "#2f8a69",
      secondary: "#11373a",
      accent: "#bbe2cf",
      background: "#f4faf7",
      backgroundSoft: "#e1ece6",
      surface: "rgba(255, 255, 255, 0.86)",
      surfaceStrong: "#ffffff",
      text: "#122825",
      muted: "#5d7570",
      line: "rgba(17, 55, 58, 0.1)",
      shadow: "0 30px 80px rgba(13, 39, 42, 0.09)"
    },
    dark: {
      primary: "#85dfbc",
      secondary: "#effaf5",
      accent: "#2c7d5e",
      background: "#081717",
      backgroundSoft: "#0f2020",
      surface: "rgba(11, 26, 25, 0.84)",
      surfaceStrong: "#122d2b",
      text: "#eef9f4",
      muted: "#c3d8d0",
      line: "rgba(238, 249, 244, 0.12)",
      shadow: "0 30px 80px rgba(0, 0, 0, 0.38)"
    }
  },
  purple: {
    light: {
      primary: "#7953ab",
      secondary: "#143641",
      accent: "#d9c4f0",
      background: "#f8f5fb",
      backgroundSoft: "#e8e1f0",
      surface: "rgba(255, 255, 255, 0.86)",
      surfaceStrong: "#ffffff",
      text: "#162728",
      muted: "#666773",
      line: "rgba(37, 39, 53, 0.1)",
      shadow: "0 30px 80px rgba(26, 31, 42, 0.1)"
    },
    dark: {
      primary: "#c9a6f4",
      secondary: "#eef9fb",
      accent: "#68468f",
      background: "#0a1318",
      backgroundSoft: "#111d22",
      surface: "rgba(14, 24, 29, 0.84)",
      surfaceStrong: "#182b31",
      text: "#eef7fb",
      muted: "#d5c9e4",
      line: "rgba(238, 247, 251, 0.12)",
      shadow: "0 30px 80px rgba(0, 0, 0, 0.4)"
    }
  }
};

export const themePresetMap: Record<ThemePresetKey, ThemePalette> = Object.fromEntries(
  themePresetKeys.map((key) => [
    key,
    {
      primary: themeVariableMap[key].light.primary,
      secondary: themeVariableMap[key].light.secondary,
      accent: themeVariableMap[key].light.accent,
      background: themeVariableMap[key].light.background,
      backgroundSoft: themeVariableMap[key].light.backgroundSoft
    }
  ])
) as Record<ThemePresetKey, ThemePalette>;

export const themePresetOptions = [
  { value: "gold", label: "Gold" },
  { value: "white", label: "White" },
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" }
] as const satisfies ReadonlyArray<{
  value: ThemePresetKey;
  label: string;
}>;

export function isThemePresetKey(value: string): value is ThemePresetKey {
  return themePresetKeys.includes(value as ThemePresetKey);
}

export function getThemePresetPalette(
  preset: ThemePresetKey,
  fallback = themePresetMap.gold
): ThemePalette {
  return themePresetMap[preset] ?? fallback;
}

export function getThemePresetVariableSet(
  preset: ThemePresetKey,
  appearance: ThemeAppearance
) {
  return themeVariableMap[preset]?.[appearance] ?? themeVariableMap.gold[appearance];
}

export function mapLiturgicalColorToThemePreset(color: string): ThemePresetKey {
  const normalized = color.trim().toLowerCase();

  if (!normalized) {
    return "gold";
  }

  if (normalized.includes("green")) {
    return "green";
  }

  if (normalized.includes("red")) {
    return "red";
  }

  if (normalized.includes("purple") || normalized.includes("violet")) {
    return "purple";
  }

  if (normalized.includes("white")) {
    return "white";
  }

  if (normalized.includes("rose") || normalized.includes("gold")) {
    return "gold";
  }

  return "gold";
}
