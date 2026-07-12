import { create } from 'zustand';

interface RecentSearchState {
  items: string[];
  addSearch: (term: string) => void;
  removeSearch: (term: string) => void;
  clearAll: () => void;
}

// 검색바 최근 검색어 드롭다운 — Figma node 1260:3015 예시 5건 그대로 시드
// 백엔드 API 준비되면 addSearch 안에서 서버에도 반영하도록 교체
export const useRecentSearchStore = create<RecentSearchState>((set) => ({
  items: [
    '근로 장학금 (교내)',
    '서울인재해외교환학생 장학금',
    '국가 근로 장학금',
    'OO대학교 장학금',
    '성적 우수 장학금',
  ],
  addSearch: (term) =>
    set((state) => ({
      items: [term, ...state.items.filter((item) => item !== term)].slice(0, 5),
    })),
  removeSearch: (term) =>
    set((state) => ({ items: state.items.filter((item) => item !== term) })),
  clearAll: () => set({ items: [] }),
}));
