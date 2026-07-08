"use client";

import { useEffect, useSyncExternalStore } from "react";
import { DeviceIcon, MoonIcon, SunIcon } from "@/components/site-icons";

export type ThemeMode = "system" | "light" | "dark";

const storageKey = "olol-theme-mode";
const themeEvent = "olol-theme-mode-change";

const themeOptions = [
  { value: "system" as const, label: "System", icon: DeviceIcon },
  { value: "light" as const, label: "Light", icon: SunIcon },
  { value: "dark" as const, label: "Dark", icon: MoonIcon }
];

function applyThemeMode(mode: ThemeMode) {
  document.documentElement.dataset.appearance = mode;
}

function getThemeModeSnapshot(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const savedMode = window.localStorage.getItem(storageKey);

  return savedMode === "light" || savedMode === "dark" || savedMode === "system"
    ? savedMode
    : "system";
}

function subscribeToThemeMode(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const callback = () => onStoreChange();

  window.addEventListener("storage", callback);
  window.addEventListener(themeEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(themeEvent, callback);
  };
}

export function ThemeModeToggle() {
  const mode = useSyncExternalStore<ThemeMode>(
    subscribeToThemeMode,
    getThemeModeSnapshot,
    () => "system"
  );

  useEffect(() => {
    applyThemeMode(mode);
  }, [mode]);

  function updateMode(nextMode: ThemeMode) {
    applyThemeMode(nextMode);
    window.localStorage.setItem(storageKey, nextMode);
    window.dispatchEvent(new Event(themeEvent));
  }

  return (
    <div className="theme-toggle" aria-label="Theme mode">
      {themeOptions.map((option) => {
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            className={`theme-toggle__button${mode === option.value ? " is-active" : ""}`}
            aria-pressed={mode === option.value}
            aria-label={option.label}
            title={option.label}
            onClick={() => updateMode(option.value)}
          >
            <Icon className="icon icon--tiny" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
