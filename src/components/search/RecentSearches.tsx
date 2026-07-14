import closeIcon from '../../assets/notification/close.svg';
import { useRecentSearchStore } from '../../store/useRecentSearchStore';

interface RecentSearchesProps {
  onSelect: (term: string) => void;
}

// 최근 검색어 칩 목록 + 전체 삭제: Figma node 1200:1723
export default function RecentSearches({ onSelect }: RecentSearchesProps) {
  const items = useRecentSearchStore((state) => state.items);
  const removeSearch = useRecentSearchStore((state) => state.removeSearch);
  const clearAll = useRecentSearchStore((state) => state.clearAll);

  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold leading-8 tracking-[-0.01em] text-[#0A0C11]">최근 검색어</h2>
        <button type="button" onClick={clearAll} className="text-sm font-medium text-[#747883] underline">
          전체 삭제
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {items.map((term) => (
          <div
            key={term}
            className="flex items-center gap-[6px] rounded-[22px] border border-[#D2D4DA] px-[16px] py-[5px]"
          >
            <button type="button" onClick={() => onSelect(term)} className="text-base font-medium text-[#555964]">
              {term}
            </button>
            <button type="button" onClick={() => removeSearch(term)} className="shrink-0">
              <img src={closeIcon} alt="삭제" className="size-3" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
