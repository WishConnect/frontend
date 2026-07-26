import { Fragment } from 'react';
import { useRecentSearchStore } from '../../../store/useRecentSearchStore';
import { useUserStore } from '../../../store/user/user';
import { mockPopularSearches } from '../../../data/mockPopularSearches';
import recentIcon from '../../../assets/search/recent-icon.svg';

const DEFAULT_USER_NAME = '김위시';

interface SearchDropdownProps {
  query: string;
  onSelect: (term: string) => void;
}

// 입력한 부분은 흐리게, 나머지는 진하게: Figma node 1208:2193 자동완성 하이라이트
function highlightMatch(text: string, query: string) {
  const index = text.indexOf(query);
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <span className="text-[#9DA1AC]">{text.slice(index, index + query.length)}</span>
      {text.slice(index + query.length)}
    </>
  );
}

// 검색바 드롭다운: 검색어 없으면 추천 검색어(제목+설명+인기 top5) + 최근 검색어, 입력 중이면 자동완성 결과
// Figma node 1233:1948(검색어 없을 때) / 1208:2193(자동완성)
export default function SearchDropdown({ query, onSelect }: SearchDropdownProps) {
  const recentSearches = useRecentSearchStore((state) => state.items);
  // 로그인 연동 전: 로그인 안 한 상태 기본값은 DEFAULT_USER_NAME, 로그인하면 실제 유저 이름으로 자동 대체
  const userName = useUserStore((state) => state.user?.name) ?? DEFAULT_USER_NAME;
  const trimmedQuery = query.trim();

  if (trimmedQuery) {
    const matches = mockPopularSearches.filter((term) => term.includes(trimmedQuery));
    if (matches.length === 0) return null;

    return (
      <div className="absolute left-0 right-0 top-full z-10 flex flex-col gap-2 rounded-b-[24px] border border-t-0 border-[#E6E7EB] bg-[#F9FAFC] px-6 pt-4 pb-6 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]">
        {matches.map((term) => (
          <button
            key={term}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(term)}
            className="text-left text-base font-medium text-[#0A0C11]"
          >
            {highlightMatch(term, trimmedQuery)}
          </button>
        ))}
      </div>
    );
  }

  if (recentSearches.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-10 flex flex-col gap-5 rounded-b-[24px] border border-t-0 border-[#E6E7EB] bg-[#F9FAFC] px-6 pt-4 pb-6 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-[#0A0C11]">추천 검색어</h3>
        <p className="text-sm font-medium text-[#747883]">
          사용자들이 많이 찾는 장학금부터 <span className="font-semibold text-[#7962ED]">{userName}</span>님에게 맞는
          장학금까지 한눈에 확인해보세요.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {mockPopularSearches.map((term, index) => (
          <Fragment key={term}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(term)}
              className="flex items-center gap-2"
            >
              <span className="text-sm font-bold text-[#7962ED]">{index + 1}</span>
              <span className="text-sm font-medium text-[#0A0C11]">{term}</span>
            </button>
            {index < mockPopularSearches.length - 1 && <span className="h-3 w-px bg-[#9DA1AC]" />}
          </Fragment>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {recentSearches.map((term) => (
          <button
            key={term}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(term)}
            className="flex items-center gap-2 text-left text-base font-medium text-[#747883]"
          >
            <img src={recentIcon} alt="" className="size-4 shrink-0" />
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
