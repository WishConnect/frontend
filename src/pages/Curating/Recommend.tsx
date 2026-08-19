import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUserStore } from '../../store/user/user';

import Down from '../../assets/icons/CategoryDown.svg';
import Up from '../../assets/icons/CategoryUp.svg';

import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar';
import DdayStatus from '../../components/DdayStatus';
import Pagination from '../../components/common/Pagination/Pagination';
import DetailPost from '../../components/Curation/GuestPost.svg';
import { fetchCuratedScholarships } from '../../api/Curation/Curated';
import { postScholarshipEvents } from '../../api/Curation/Events';

import type {
  CuratedCampusScholarship,
  CuratedFeaturedScholarship,
  CuratedOtherScholarship,
  CuratedViewMode,
} from '../../types/Curation/Curated';

const ITEMS_PER_PAGE = 6;

type SortOption = '마감 임박순' | '최신순';

type RecommendedScholarship =
  | CuratedFeaturedScholarship
  | CuratedCampusScholarship
  | CuratedOtherScholarship;

export default function RecommendedScholarshipPage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  const [scholarships, setScholarships] = useState<RecommendedScholarship[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<CuratedViewMode>('PERSONALIZED');
  const [rankerVersion, setRankerVersion] = useState('');

  const [sortOption, setSortOption] = useState<SortOption>('마감 임박순');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const sortOptions: SortOption[] = ['마감 임박순', '최신순'];

  useEffect(() => {
    let isCancelled = false;

    const getRecommendedScholarships = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const data = await fetchCuratedScholarships({
          category: '전체',
          sort: sortOption === '최신순' ? 'LATEST' : 'DEADLINE',
          page: currentPage,
          size: ITEMS_PER_PAGE,
        });

        if (isCancelled) return;

        // 추천 장학금 전체보기는 온보딩 완료 사용자만
        if (data.viewMode !== 'PERSONALIZED') {
          navigate('/curation', { replace: true });
          return;
        }

        setViewMode(data.viewMode);
        setRankerVersion(data.rankerVersion);

        /*
         * curated API가 섹션별로 배열을 나눠주므로
         * 지원 가능한 장학금을 합쳐서 사용
         */
        const combined = [
          ...(data.featured ?? []),
          ...(data.campusScholarships ?? []),
          ...(data.otherScholarships ?? []),
        ];

        // scholarshipId 중복 제거
        const uniqueScholarships = Array.from(
          new Map(
            combined
              .filter((scholarship) => scholarship.eligible)
              .map((scholarship) => [scholarship.scholarshipId, scholarship]),
          ).values(),
        );

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        setScholarships(uniqueScholarships.slice(startIndex, endIndex));
        setTotalPages(Math.ceil(uniqueScholarships.length / ITEMS_PER_PAGE));
      } catch (error) {
        if (isCancelled) return;

        console.error('추천 장학금 조회 실패:', error);

        setScholarships([]);
        setErrorMessage(
          error instanceof Error ? error.message : '추천 장학금을 불러오지 못했습니다.',
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void getRecommendedScholarships();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, sortOption, navigate]);

  const handleScholarshipClick = (scholarship: RecommendedScholarship, position: number) => {
    void postScholarshipEvents([
      {
        scholarshipId: scholarship.scholarshipId,
        eventType: 'CLICK',
        position,
        matchScore: scholarship.matchScore,
        viewMode,
        section: scholarship.section,
        rankerVersion,
      },
    ]).catch((error) => {
      console.error('장학금 클릭 기록 실패:', error);
    });

    navigate(`/curation/${scholarship.scholarshipId}`);
  };

  return (
    <div className="min-h-[1024px] w-[1440px] bg-white font-['Pretendard']">
      <Header
        searchPlaceholder="장학금 찾아보기"
        isLoggedIn
        isSearchMode={false}
        onSearch={(query) => {
          const trimmedQuery = query.trim();

          if (!trimmedQuery) return;

          navigate(`/curation?keyword=${encodeURIComponent(trimmedQuery)}`);
        }}
      />

      <div className="flex">
        <div className="relative ml-[64px] w-[237px] shrink-0">
          <LeftSidebar activeId="curating" />
        </div>

        <main className="mt-[16px] flex w-[1139px] flex-col pb-[64px] pl-[32px] pr-[64px]">
          {/* 제목 + 정렬 */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-[8px]">
              <h1 className="text-[40px] font-bold leading-[52px] tracking-[-0.02em] text-[#10131A]">
                추천 장학금
              </h1>

              <p className="text-[16px] font-medium leading-[24px] text-[#555964]">
                위시커넥트가 확인한 {user?.name ?? '회원'}님이 지금 지원 가능한 장학금이에요.
              </p>
            </div>

            <div className="relative">
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
                          setCurrentPage(1);
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

          {isLoading && (
            <div className="flex h-[500px] items-center justify-center text-[16px] font-medium text-[#747883]">
              추천 장학금을 불러오는 중이에요.
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="flex h-[500px] items-center justify-center text-[16px] font-medium text-[#747883]">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && scholarships.length === 0 && (
            <div className="flex h-[500px] items-center justify-center text-[16px] font-medium text-[#747883]">
              현재 지원 가능한 추천 장학금이 없어요.
            </div>
          )}

          {!isLoading && !errorMessage && scholarships.length > 0 && (
            <>
              {/* 장학금 카드 */}
              <div className="mt-[32px] grid grid-cols-3 gap-x-[32px] gap-y-[32px]">
                {scholarships.map((scholarship, index) => (
                  <article
                    key={scholarship.scholarshipId}
                    onClick={() =>
                      handleScholarshipClick(
                        scholarship,
                        (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
                      )
                    }
                    className="relative h-[460px] w-[326px] cursor-pointer overflow-hidden rounded-[16px] border border-[#E6E7EB]"
                  >
                    {scholarship.posterUrl ? (
                      <img
                        src={scholarship.posterUrl}
                        alt={scholarship.title}
                        className="h-full w-[326px] object-cover"
                      />
                    ) : (
                      <img
                        src={DetailPost}
                        alt=""
                        className="block h-full w-full scale-[1.08] object-cover object-center"
                      />
                    )}

                    <div className="absolute bottom-0 left-0 min-h-[144px] w-full rounded-t-[16px] bg-white px-[24px] py-[24px]">
                      <div className="flex h-[32px] w-[278px] items-center gap-[8px]">
                        <DdayStatus days={scholarship.dDay ?? 0} />

                        <span className="text-[12px] font-medium leading-[16px] text-[#747883]">
                          {scholarship.deadline ? `${scholarship.deadline} 마감` : '마감일 미정'}
                        </span>
                      </div>

                      <h2 className="mt-[8px] line-clamp-2 text-[20px] font-semibold leading-[28px] text-[#10131A]">
                        {scholarship.title}
                      </h2>

                      <p className="mt-[4px] truncate text-[14px] font-medium leading-[20px] text-[#747883]">
                        {scholarship.organization}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-[48px] flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
