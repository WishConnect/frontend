import { useState } from 'react';
import searchIcon from '../../../assets/search-icon.svg';
import { useRecentSearchStore } from '../../../store/useRecentSearchStore';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  initialValue?: string;
}

// 검색바 컴포넌트 — className으로 기본 폭(979px)을 덮어써서 유동폭으로도 사용 가능
// 포커스 시 최근 검색어 드롭다운 노출 (Figma node 1260:3015)
export default function SearchBar({
  placeholder = '장학금 찾아보기',
  onSearch,
  className,
  initialValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const recentSearches = useRecentSearchStore((state) => state.items);
  const addSearch = useRecentSearchStore((state) => state.addSearch);

  const runSearch = (term: string) => {
    if (!term.trim()) return;
    addSearch(term);
    onSearch?.(term);
    setIsFocused(false);
  };

  const handleSearch = () => runSearch(query);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    runSearch(term);
  };

  const isDropdownOpen = isFocused && recentSearches.length > 0;

  return (
    <div className={`relative ${className ?? 'w-[979px]'}`}>
      <div
        className={`flex items-center h-[48px] bg-[#F9FAFC] border border-[#E6E7EB] !pl-[24px] !pr-[12px] gap-3 ${
          isDropdownOpen ? 'rounded-t-[24px] border-b-0' : 'rounded-[24px]'
        }`}
      >
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={query}
            placeholder={placeholder}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-transparent outline-none text-[#9DA1AC] text-base font-medium placeholder:text-[#9DA1AC]"
          />
        </div>
        <button type="button" onClick={handleSearch} className="shrink-0">
          <img src={searchIcon} alt="검색" width={18} height={18} />
        </button>
      </div>

      {isDropdownOpen && (
        <div className="absolute left-0 right-0 top-full z-10 flex flex-col gap-4 rounded-b-[24px] border border-t-0 border-[#E6E7EB] bg-[#F9FAFC] px-6 pt-4 pb-6 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]">
          {recentSearches.map((term) => (
            <button
              key={term}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectRecent(term)}
              className="flex items-center gap-2 text-left text-base font-medium text-[#747883]"
            >
              {/* 최근 검색어 아이콘 자리 — 디자인팀 에셋(시계) 확정되면 교체 */}
              <span className="h-6 w-6 shrink-0" />
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
