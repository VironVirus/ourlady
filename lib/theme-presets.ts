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
      primary: "#9a7431",
      secondary: "#4a3219",
      accent: "#d9b86d",
      background: "#f5efe5",
      backgroundSoft: "#ece1cf",
      surface: "rgba(255, 251, 244, 0.82)",
      surfaceStrong: "#fffaf1",
      text: "#23180f",
      muted: "#6d5a4a",
      line: "rgba(65, 45, 24, 0.14)",
      shadow: "0 30px 80px rgba(38, 25, 12, 0.12)"
    },
    dark: {
      primary: "#ebc97f",
      secondary: "#fff0cf",
      accent: "#a4762d",
      background: "#120d08",
      backgroundSoft: "#1d140c",
      surface: "rgba(32, 22, 13, 0.82)",
      surfaceStrong: "#24190f",
      text: "#fff7ea",
      muted: "#e4d0ad",
      line: "rgba(255, 233, 196, 0.16)",
      shadow: "0 30px 80px rgba(0, 0, 0, 0.35)"
    }
  },
  white: {
    light: {
      primary: "#7e7361",
      secondary: "#2f2b24",
      accent: "#d8d1c5",
      background: "#f7f4ef",
      backgroundSoft: "#ece7df",
      surface: "rgba(255, 255, 253, 0.84)",
      surfaceStrong: "#fffdfa",
      text: "#221f1a",
      muted: "#6e665c",
      line: "rgba(61, 53, 42, 0.12)",
      shadow: "0 30px 80px rgba(27, 23, 18, 0.1)"
    },
    dark: {
      primary: "#e5ddd0",
      secondary: "#fffdfa",
      accent: "#918571",
      background: "#11110f",
      backgroundSoft: "#181714",
      surface: "rgba(32, 31, 27, 0.84)",
      surfaceStrong: "#24231f",
      text: "#fffdf8",
      muted: "#e3dccf",
      line: "rgba(250, 245, 236, 0.15)",
      shadow: "0 30px 80px rgba(0, 0, 0, 0.34)"
    }
  },
  red: {
    light: {
      primary: "#a53d39",
      secondary: "#4a1e1d",
      accent: "#de8d87",
      background: "#f7ece9",
      backgroundSoft: "#f1dcd5",
      surface: "rgba(255, 250, 248, 0.84)",
      surfaceStrong: "#fff8f6",
      text: "#261313",
      muted: "#79514d",
      line: "rgba(90, 28, 26, 0.14)",
      shadow: "0 30px 80px rgba(61, 21, 21, 0.12)"
    },
    dark: {
      primary: "#f09389",
      secondary: "#fff0ed",
      accent: "#9a3431",
      background: "#170c0c",
      backgroundSoft: "#201111",
      surface: "rgba(38, 18, 18, 0.84)",
      surfaceStrong: "#2b1616",
      text: "#fff0ed",
      muted: "#e7c1bc",
      line: "rgba(255, 229, 224, 0.15)",
      shadow: "0 30px 80px rgba(0, 0, 0, 0.36)"
    }
  },
  green: {
    light: {
      primary: "#557a39",
      secondary: "#24381a",
      accent: "#a9c287",
      background: "#eff3e8",
      backgroundSoft: "#e0e8d5",
      surface: "rgba(252, 255, 249, 0.84)",
      surfaceStrong: "#f9fcf5",
      text: "#1a2415",
      muted: "#58674d",
      line: "rgba(42, 58, 31, 0.13)",
      shadow: "0 30px 80px rgba(31, 43, 24, 0.11)"
    },
    dark: {
      primary: "#badf90",
      secondary: "#f6ffe9",
      accent: "#4d7031",
      background: "#0f140c",
      backgroundSoft: "#171e12",
      surface: "rgba(25, 34, 20, 0.84)",
      surfaceStrong: "#1c2717",
      text: "#f5ffed",
      muted: "#d3e2c4",
      line: "rgba(235, 248, 221, 0.15)",
      shadow: "0 30px 80px rgba(0, 0, 0, 0.34)"
    }
  },
  purple: {
    light: {
      primary: "#6a4a7d",
      secondary: "#2f1f3d",
      accent: "#b79dca",
      background: "#f2edf5",
      backgroundSoft: "#e5dbec",
      surface: "rgba(255, 251, 255, 0.84)",
      surfaceStrong: "#fcf8ff",
      text: "#211726",
      muted: "#62556a",
      line: "rgba(54, 34, 69, 0.13)",
      shadow: "0 30px 80px rgba(34, 23, 43, 0.12)"
    },
    dark: {
      primary: "#d5b8e8",
      secondary: "#fbf0ff",
      accent: "#644578",
      background: "#110d14",
      backgroundSoft: "#18111d",
      surface: "rgba(28, 19, 33, 0.84)",
      surfaceStrong: "#211627",
      text: "#faf0ff",
      muted: "#e0cde8",
      line: "rgba(244, 231, 255, 0.15)",
      shadow: "0 30px 80px rgba(0, 0, 0, 0.35)"
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
