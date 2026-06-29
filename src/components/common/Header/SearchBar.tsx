import { useState } from 'react';
import searchIcon from '../../../assets/search-icon.svg';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

// 검색바 컴포넌트
export default function SearchBar({
  placeholder = '장학금 찾아보기',
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch?.(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="flex items-center w-[538px] h-[48px] bg-[#F9FAFC] rounded-lg !pl-[24px] !pr-[12px] gap-3">
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent outline-none text-[#9DA1AC] text-base font-medium placeholder:text-[#9DA1AC]"
        />
      </div>
      <button onClick={handleSearch} className="shrink-0">
        <img src={searchIcon} alt="검색" width={18} height={18} />
      </button>
    </div>
  );
}
