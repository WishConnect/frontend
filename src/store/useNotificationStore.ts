import { create } from 'zustand';

export type NotificationCategory = '맞춤 장학금' | '일정' | '작성' | '기타';

export interface NotificationItem {
  // 서버의 notificationId. 읽음 처리 API가 숫자를 받으므로 number로 둔다.
  id: number;
  category: NotificationCategory;
  timeAgo: string;
  title: string;
  description: string;
  ctaLabel: string;
  // CTA 클릭 시 이동할 라우트. 서버의 relatedType/relatedId를 변환해서 넣는다 (api/notification/list.ts)
  link: string;
  isRead: boolean;
}

interface NotificationState {
  items: NotificationItem[];
  isPanelOpen: boolean;
  unreadCount: () => number;
  setItems: (items: NotificationItem[]) => void;
  togglePanel: () => void;
  markAsRead: (id: number) => void;
  removeItem: (id: number) => void;
  clearAll: () => void;
}

// 헤더 벨/알림센터 패널 상태. 목록은 Header가 마운트될 때 서버에서 받아 setItems로 채운다.
export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  isPanelOpen: false,
  unreadCount: () => get().items.filter((item) => !item.isRead).length,
  setItems: (items) => set({ items }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  markAsRead: (id) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  clearAll: () => set({ items: [] }),
}));
