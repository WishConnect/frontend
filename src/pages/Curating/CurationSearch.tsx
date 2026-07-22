import { useMemo, useRef, useState } from 'react';
import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar';
import { useNavigate } from 'react-router-dom';
import SearchScholarshipRow from '../../components/Curation/Search';
import { scholarships } from '../../mock/scholarships';
import Down from '../../assets/icons/CategoryDown.svg';
import Up from '../../assets/icons/CategoryUp.svg';

type SortOption = '마감 임박순' | '최신순' | '높은 금액순' | '저장한 장학금';

interface CurationSearchPageProps {
  query: string;
  isLoggedIn: boolean;
}

export default function CurationSearchPage({ query, isLoggedIn }: CurationSearchPageProps) {
  const [sortOption, setSortOption] = useState<SortOption>('마감 임박순');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const navigate = useNavigate();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollRatio, setScrollRatio] = useState(0);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScrollTop = el.scrollHeight - el.clientHeight;

    if (maxScrollTop <= 0) {
      setScrollRatio(0);
      return;
    }

    setScrollRatio(el.scrollTop / maxScrollTop);
  };
  const filteredScholarships = useMemo(() => {
    const result = scholarships.filter((scholarship) => {
      const keyword = query.trim();

      return (
        scholarship.title.includes(keyword) ||
        scholarship.tags.some((tag) => tag.includes(keyword)) ||
        scholarship.summary.organization.includes(keyword)
      );
    });

    const sorted = [...result];

    if (sortOption === '마감 임박순') {
      sorted.sort((a, b) => a.days - b.days);
    }

    if (sortOption === '높은 금액순') {
      sorted.sort((a, b) => {
        const aAmount = Number(a.summary.amount.replace(/[^0-9]/g, ''));
        const bAmount = Number(b.summary.amount.replace(/[^0-9]/g, ''));
        return bAmount - aAmount;
      });
    }

    if (sortOption === '저장한 장학금') {
      return sorted.filter((scholarship) => scholarship.isScrapped);
    }

    return sorted;
  }, [query, sortOption]);

  const sortOptions: SortOption[] = ['마감 임박순', '최신순', '높은 금액순', '저장한 장학금'];
  const hasScroll = filteredScholarships.length > 5;
  return (
    <div className="h-[1024px] w-[1440px] bg-white font-['Pretendard']">
      <Header
        searchPlaceholder={query || '장학금 찾아보기'}
        isLoggedIn={isLoggedIn}
        isSearchMode={false}
        onSearch={(nextQuery) => {
          const trimmedQuery = nextQuery.trim();

          if (!trimmedQuery) {
            navigate('/curation');
            return;
          }

          navigate(`/curation?keyword=${encodeURIComponent(trimmedQuery)}`);
        }}
      />

      <div className="flex">
        <div className="ml-[64px]">
          <LeftSidebar activeId="curating" />
        </div>

        <main className="ml-[32px] flex w-[1043px] flex-col">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[40px] font-bold leading-[52px] text-[#10131A]">
                '{query}' 검색 결과
              </h1>

              <p className="mt-[4px] text-[16px] font-medium leading-[24px] text-[#555964]">
                총 <span className="text-[#7962ED]">{filteredScholarships.length}개</span>의
                장학금을 찾았어요.
              </p>
            </div>

            <div className="relative mt-[16px]">
              <button
                type="button"
                onClick={() => setIsSortOpen((prev) => !prev)}
                className="flex h-[48px] w-[164px] items-center justify-between rounded-[8px] bg-[#F9FAFC] px-[24px] text-[16px] font-medium text-[#555964]"
              >
                {sortOption}
                <img src={isSortOpen ? Up : Down} alt={isSortOpen ? '위 화살표' : '아래 화살표'} />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-[56px] z-10 w-[164px] overflow-hidden rounded-[8px] border border-[#D2D4DA] bg-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]">
                  {sortOptions
                    .filter((option) => option !== sortOption)
                    .map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setSortOption(option);

                          setIsSortOpen(false);
                        }}
                        className="flex h-[56px] w-full items-center px-[24px] text-[16px] font-medium text-[#555964] hover:bg-[#F9FAFC]"
                      >
                        {option}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-[24px] flex w-[1043px] gap-[12px]">
            <section
              ref={scrollRef}
              onScroll={handleScroll}
              className={`w-[1027px] overflow-y-auto rounded-[16px] border border-[#D2D4DA] [&::-webkit-scrollbar]:hidden ${
                hasScroll ? 'h-[768px]' : 'h-auto'
              }`}
            >
              {filteredScholarships.map((scholarship) => (
                <SearchScholarshipRow key={scholarship.id} scholarship={scholarship} />
              ))}
            </section>

            {hasScroll && (
              <div className="relative h-[768px] w-[4px] rounded-full bg-[#E6E7EB]">
                <div
                  className="absolute left-0 w-[4px] rounded-full bg-[#7962ED]"
                  style={{
                    height: '477px',
                    top: `${scrollRatio * (768 - 477)}px`,
                  }}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
