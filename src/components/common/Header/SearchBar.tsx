import { useState } from 'react';
import searchIcon from '../../../assets/search-icon.svg';
import { useRecentSearchStore } from '../../../store/useRecentSearchStore';
import SearchDropdown from './SearchDropdown';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onQueryChange?: (query: string) => void;
  className?: string;
  initialValue?: string;
}

// 검색바 컴포넌트: className으로 기본 폭(979px)을 덮어써서 유동폭으로도 사용 가능
// 포커스 시 최근/추천 검색어 드롭다운, 입력 중이면 자동완성 노출 (SearchDropdown)
// onQueryChange는 입력할 때마다(실시간), onSearch는 엔터/검색 버튼/드롭다운 선택 시(제출)에만 호출됨
export default function SearchBar({
  placeholder = '장학금 찾아보기',
  onSearch,
  onQueryChange,
  className,
  initialValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const addSearch = useRecentSearchStore((state) => state.addSearch);

  const updateQuery = (value: string) => {
    setQuery(value);
    onQueryChange?.(value);
  };

  const runSearch = (term: string) => {
    const trimmed = term.trim();
    if (trimmed) addSearch(trimmed);
    onSearch?.(term);
    setIsFocused(false);
  };

  const handleSearch = () => runSearch(query);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSelectSuggestion = (term: string) => {
    updateQuery(term);
    runSearch(term);
  };

  return (
    <div className={`relative ${className ?? 'w-[979px]'}`}>
      <div
        className={`flex items-center h-[48px] bg-[#F9FAFC] border border-[#E6E7EB] !pl-[24px] !pr-[12px] gap-3 ${
          isFocused ? 'rounded-t-[24px] border-b-0' : 'rounded-[24px]'
        }`}
      >
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={query}
            placeholder={placeholder}
            onChange={(e) => updateQuery(e.target.value)}
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

      {isFocused && <SearchDropdown query={query} onSelect={handleSelectSuggestion} />}
    </div>
  );
}
