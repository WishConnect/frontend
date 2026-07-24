import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar';
import SearchScholarshipRow from '../../components/Curation/Search';

import Down from '../../assets/icons/CategoryDown.svg';
import Up from '../../assets/icons/CategoryUp.svg';

import { fetchScholarshipSearch } from '../../api/Curation/Search';

import type {
  ScholarshipSearchItem,
  SearchScholarshipRowData,
  SortOption,
  SortParam,
} from '../../types/Curation/Search';

interface CurationSearchPageProps {
  query: string;
  isLoggedIn: boolean;
}

const SORT_OPTIONS: SortOption[] = ['마감 임박순', '높은 금액순', '최신순', '저장한 장학금'];

// sortOption → { sort, scrappedOnly } 매핑
// '저장한 장학금'은 정렬이 아니라 필터라서 sort는 기본값(deadline)으로 두고 scrappedOnly만 true로 보냄
const SORT_PARAM_MAP: Record<SortOption, { sort: SortParam; scrappedOnly: boolean }> = {
  '마감 임박순': { sort: 'deadline', scrappedOnly: false },
  최신순: { sort: 'latest', scrappedOnly: false },
  '높은 금액순': { sort: 'amount', scrappedOnly: false },
  '저장한 장학금': { sort: 'deadline', scrappedOnly: true },
};

const convertToRowData = (scholarship: ScholarshipSearchItem): SearchScholarshipRowData => {
  return {
    id: scholarship.scholarshipId,
    title: scholarship.title,
    days: scholarship.dDay,
    deadline: scholarship.deadline,
    recruitStatus: scholarship.recruitStatus,
    tags: scholarship.tags,
    isScrapped: scholarship.isScrapped,
    summary: {
      amount: scholarship.maxAmount,
      organization: scholarship.organization,
      applicationPeriod: scholarship.applicationPeriod,
    },
  };
};

export default function CurationSearchPage({ query, isLoggedIn }: CurationSearchPageProps) {
  const navigate = useNavigate();

  const [sortOption, setSortOption] = useState<SortOption>('마감 임박순');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [scholarships, setScholarships] = useState<SearchScholarshipRowData[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const scrollRef = useRef<HTMLElement>(null);
  const [scrollRatio, setScrollRatio] = useState(0);

  const handleScroll = () => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const maxScrollTop = element.scrollHeight - element.clientHeight;

    if (maxScrollTop <= 0) {
      setScrollRatio(0);
      return;
    }

    setScrollRatio(element.scrollTop / maxScrollTop);
  };

  useEffect(() => {
    let isCancelled = false;

    const getScholarships = async () => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery) {
        setScholarships([]);
        setTotalCount(0);
        setErrorMessage('');
        setIsLoading(false);
        return;
      }

      const { sort, scrappedOnly } = SORT_PARAM_MAP[sortOption];

      // '저장한 장학금'인데 비로그인 상태면 서버가 401을 내려주지만,
      // 굳이 요청 보내지 않고 프론트에서 먼저 막아주는 게 UX상 자연스러움
      if (scrappedOnly && !isLoggedIn) {
        setScholarships([]);
        setTotalCount(0);
        setErrorMessage('로그인 후 이용할 수 있어요.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');
        setScrollRatio(0);

        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }

        const data = await fetchScholarshipSearch({
          keyword: trimmedQuery,
          sort,
          scrappedOnly,
          page: 1,
          size: 20,
        });

        if (isCancelled) {
          return;
        }

        const convertedScholarships = data.results.map(convertToRowData);

        setScholarships(convertedScholarships);
        setTotalCount(data.totalCount);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error('장학금 검색 실패:', error);

        setScholarships([]);
        setTotalCount(0);

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('검색 결과를 불러오지 못했습니다.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void getScholarships();

    return () => {
      isCancelled = true;
    };
  }, [query, sortOption, isLoggedIn]);

  const hasScroll = scholarships.length > 5;

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
                총 <span className="text-[#7962ED]">{totalCount}개</span>의 장학금을 찾았어요.
              </p>
            </div>

            <div className="relative mt-[16px]">
              <button
                type="button"
                onClick={() => setIsSortOpen((prev) => !prev)}
                className="flex h-[48px] w-[164px] items-center justify-between rounded-[8px] bg-[#F9FAFC] px-[24px] text-[16px] font-medium text-[#555964]"
              >
                <span>{sortOption}</span>

                <img
                  src={isSortOpen ? Up : Down}
                  alt={isSortOpen ? '정렬 목록 닫기' : '정렬 목록 열기'}
                />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-[56px] z-10 w-[164px] overflow-hidden rounded-[8px] border border-[#D2D4DA] bg-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]">
                  {SORT_OPTIONS.filter((option) => option !== sortOption).map((option) => (
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
              {isLoading && (
                <div className="flex h-[300px] items-center justify-center text-[16px] font-medium text-[#747883]">
                  검색 결과를 불러오는 중이에요.
                </div>
              )}

              {!isLoading && errorMessage && (
                <div className="flex h-[300px] items-center justify-center text-[16px] font-medium text-[#747883]">
                  {errorMessage}
                </div>
              )}

              {!isLoading && !errorMessage && scholarships.length === 0 && (
                <div className="flex h-[300px] items-center justify-center text-[16px] font-medium text-[#747883]">
                  검색 결과가 없어요.
                </div>
              )}

              {!isLoading &&
                !errorMessage &&
                scholarships.map((scholarship) => (
                  <SearchScholarshipRow key={scholarship.id} scholarship={scholarship} />
                ))}
            </section>

            {hasScroll && !isLoading && !errorMessage && (
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
