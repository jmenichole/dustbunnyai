import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Settings {
  autoCleanup: boolean;
  cleanupFrequency: "daily" | "weekly" | "monthly";
  emailNotifications: boolean;
  privacyScans: boolean;
  theme: "light" | "dark" | "system";
}

interface SettingsStore {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: {
        autoCleanup: false,
        cleanupFrequency: "weekly",
        emailNotifications: true,
        privacyScans: true,
        theme: "system",
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: "dustbunny-settings",
    }
  )
);
