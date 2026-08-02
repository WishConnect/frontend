import { create } from 'zustand';
import type { NotificationSettings } from '../api/notification/settings';

interface NotificationCategorySettings {
  scholarship: boolean;
  schedule: boolean;
  writing: boolean;
  etc: boolean;
}

interface NotificationSettingsState {
  showBadge: boolean;
  categories: NotificationCategorySettings;
  toggleBadge: () => void;
  toggleCategory: (key: keyof NotificationCategorySettings) => void;
  initSettings: (settings: NotificationSettings) => void;
}

// 알림 설정 페이지 상태: Figma node 1428:4581 기준, mock이라 전부 기본 켜짐
export const useNotificationSettingsStore = create<NotificationSettingsState>((set) => ({
  showBadge: true,
  categories: {
    scholarship: true,
    schedule: true,
    writing: true,
    etc: true,
  },
  toggleBadge: () => set((state) => ({ showBadge: !state.showBadge })),
  toggleCategory: (key) =>
    set((state) => ({
      categories: { ...state.categories, [key]: !state.categories[key] },
    })),

    initSettings: (settings) => set({
    showBadge: settings.notificationEnabled,
    categories: {
      scholarship: settings.matchingEnabled,
      schedule: settings.scheduleEnabled,
      writing: settings.essayEnabled,
      etc: settings.etcEnabled,
    }
  }),
}));
