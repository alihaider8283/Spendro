import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SettingsState {
  themeMode: 'light' | 'dark' | 'system';
  aiAutoCategorization: boolean;
  notifications: boolean;
  currency: string;
  cloudBackup: boolean;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setAiAutoCategorization: (enabled: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  setCurrency: (currency: string) => void;
  setCloudBackup: (enabled: boolean) => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      aiAutoCategorization: true,
      notifications: true,
      currency: 'USD',
      cloudBackup: false,

      setThemeMode: (mode) => {
        set({ themeMode: mode });
        if (mode === 'system') {
          Appearance.setColorScheme('unspecified' as any);
        } else {
          Appearance.setColorScheme(mode);
        }
      },

      setAiAutoCategorization: (enabled) => {
        set({ aiAutoCategorization: enabled });
      },

      setNotifications: (enabled) => {
        set({ notifications: enabled });
      },

      setCurrency: (currency) => {
        set({ currency });
      },

      setCloudBackup: (enabled) => {
        set({ cloudBackup: enabled });
      },

      loadSettings: async () => {
        // Zustand persist auto-hydrates, but we can verify/force rehydration if needed
        if (!useSettingsStore.persist?.hasHydrated()) {
          await useSettingsStore.persist?.rehydrate();
        }
        // Apply theme after hydration
        const state = useSettingsStore.getState();
        if (state.themeMode === 'system') {
          Appearance.setColorScheme('unspecified' as any);
        } else {
          Appearance.setColorScheme(state.themeMode);
        }
      },
    }),
    {
      name: 'spendro-settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.themeMode === 'system') {
            Appearance.setColorScheme('unspecified' as any);
          } else {
            Appearance.setColorScheme(state.themeMode);
          }
        }
      },
    }
  )
);
