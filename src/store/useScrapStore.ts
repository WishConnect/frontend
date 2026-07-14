import { create } from 'zustand';
import { mockScholarships } from '../data/mockScholarships';

interface ScrapState {
  scrappedIds: Set<string>;
  isScrapped: (id: string) => boolean;
  toggleScrap: (id: string) => void;
}

// 아카이빙 페이지는 "내가 스크랩한 장학금" 목록이라는 전제: mock 초기값은 전부 스크랩된 상태로 시드
// 백엔드 API 준비되면 초기값은 fetch 결과로, toggleScrap 안에서 서버 반영하도록 교체
export const useScrapStore = create<ScrapState>((set, get) => ({
  scrappedIds: new Set(mockScholarships.map((scholarship) => scholarship.id)),
  isScrapped: (id) => get().scrappedIds.has(id),
  toggleScrap: (id) =>
    set((state) => {
      const next = new Set(state.scrappedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { scrappedIds: next };
    }),
}));
