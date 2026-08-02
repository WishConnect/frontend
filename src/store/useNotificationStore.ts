import { create } from 'zustand';

export type NotificationCategory = '맞춤 장학금' | '일정' | '작성' | '기타';

interface NotificationItem {
  id: string;
  category: NotificationCategory;
  timeAgo: string;
  title: string;
  description: string;
  ctaLabel: string;
  // CTA 클릭 시 이동할 라우트. 지금은 mock, API 붙으면 서버가 내려주는 딥링크로 교체
  link: string;
  isRead: boolean;
}

interface NotificationState {
  items: NotificationItem[];
  isPanelOpen: boolean;
  unreadCount: () => number;
  togglePanel: () => void;
  markAsRead: (id: string) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
}

// 헤더 알림 벨/알림센터 패널 상태: Figma node 1122:2842 예시 3건 그대로 시드
export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [
    // {
    //   id: 'mock-1',
    //   category: '맞춤 장학금',
    //   timeAgo: '2분 전',
    //   title: '조건에 맞는 신규 장학금이 등록되었어요!',
    //   description: '김위시님 조건에 맞는 ‘OO장학재단 생활비 장학금’이 새로 모집을 시작했어요.',
    //   ctaLabel: '바로 보기 →',
    //   link: '/curation',
    //   isRead: false,
    // },
    // {
    //   id: 'mock-2',
    //   category: '일정',
    //   timeAgo: '1시간 전',
    //   title: '스크랩한 ‘희망장학금’이 마감 임박이에요!',
    //   description: '마감까지 D-3 남았어요. 놓치지 말고 지원해 보세요.',
    //   ctaLabel: '지원서 이어쓰기 →',
    //   link: '/write',
    //   isRead: false,
    // },
    // {
    //   id: 'mock-3',
    //   category: '작성',
    //   timeAgo: '어제',
    //   title: '작성 중인 지원서가 있어요.',
    //   description: '‘희망장학금’ 2/5 문항까지 작성되었어요.',
    //   ctaLabel: '이어서 작성하기 →',
    //   link: '/write',
    //   isRead: true,
    // },
  ],
  isPanelOpen: false,
  unreadCount: () => get().items.filter((item) => !item.isRead).length,
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  markAsRead: (id) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  clearAll: () => set({ items: [] }),
}));
