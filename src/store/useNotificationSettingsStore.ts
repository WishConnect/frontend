import { create } from 'zustand';

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
}));
