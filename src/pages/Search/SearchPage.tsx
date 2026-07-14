import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import SearchBox from '../../components/search/SearchBox';
import RecentSearches from '../../components/search/RecentSearches';
import PopularSearches from '../../components/search/PopularSearches';
import SearchTipBanner from '../../components/search/SearchTipBanner';
import { useRecentSearchStore } from '../../store/useRecentSearchStore';

// 장학금 찾아보기 검색 페이지: Figma node 1179:1941(기본) / 1200:1767(필터 열림)
export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const addSearch = useRecentSearchStore((state) => state.addSearch);

  const handleSearch = (term: string = query) => {
    if (!term.trim()) return;
    addSearch(term);
    // TODO: 검색 결과 페이지 라우팅 연결
  };

  const handleSelect = (term: string) => {
    setQuery(term);
    handleSearch(term);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header isSearchMode onBack={() => navigate(-1)} />

      <div className="flex flex-col gap-10 px-16 py-6">
        <h1 className="text-[32px] font-bold leading-[1.3] text-[#0A0C11]">장학금 찾아보기</h1>

        <div className="flex flex-col gap-6">
          <SearchBox
            query={query}
            onQueryChange={setQuery}
            onSearch={() => handleSearch()}
            isFilterOpen={isFilterOpen}
            onToggleFilter={() => setIsFilterOpen((open) => !open)}
          />
          {!isFilterOpen && <RecentSearches onSelect={handleSelect} />}
        </div>

        <PopularSearches onSelect={handleSelect} />
        <SearchTipBanner />
      </div>
    </div>
  );
}
