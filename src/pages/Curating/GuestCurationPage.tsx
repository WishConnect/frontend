import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArchivePost from '../../components/Curation/GuestPost.svg';
import Down from '../../assets/icons/CategoryDown.svg';
import Up from '../../assets/icons/CategoryUp.svg';

import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar';
import DdayStatus from '../../components/DdayStatus';
import Pagination from '../../components/common/Pagination/Pagination';

import { fetchCuratedScholarships } from '../../api/Curation/Curated';

import type { CuratedOtherScholarship, CuratedSort } from '../../types/Curation/Curated';

const ITEMS_PER_PAGE = 9;

type SortOption = '마감 임박순' | '최신순';

const SORT_MAP: Record<SortOption, CuratedSort> = {
  '마감 임박순': 'DEADLINE',
  최신순: 'LATEST',
};

export default function GuestCurationPage() {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>('마감 임박순');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [scholarships, setScholarships] = useState<CuratedOtherScholarship[]>([]);

  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const sortOptions: SortOption[] = ['마감 임박순', '최신순'];

  useEffect(() => {
    let isCancelled = false;

    const loadGuestScholarships = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const data = await fetchCuratedScholarships({
          sort: SORT_MAP[sortOption],
          page: currentPage,
          size: ITEMS_PER_PAGE,
        });

        if (isCancelled) {
          return;
        }

        setScholarships(data.otherScholarships ?? []);

        setTotalPages(Math.max(1, data.pagination?.totalPages ?? 1));
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error('비로그인 큐레이팅 조회 실패:', error);

        setScholarships([]);
        setTotalPages(1);

        setErrorMessage(error instanceof Error ? error.message : '장학금을 불러오지 못했습니다.');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadGuestScholarships();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, sortOption]);

  return (
    <div className="h-[1024px] w-[1440px] bg-white font-['Pretendard']">
      <Header
        searchPlaceholder="장학금 찾아보기"
        isLoggedIn={false}
        isSearchMode={false}
        onSearch={(query) => {
          navigate(`/curation?keyword=${query}`);
        }}
      />

      <div className="flex">
        <div className="relative ml-[64px] w-[237px] shrink-0">
          <LeftSidebar activeId="curating" />
        </div>

        <main className="mt-[16px] flex w-[1139px] flex-col pb-[64px] pl-[32px] pr-[64px]">
          {/* 제목 + 정렬 */}
          <div className="flex items-end gap-[462px]">
            <div className="flex w-[416px] flex-col gap-[4px]">
              <h1 className="h-[104px] text-[40px] font-bold leading-[52px] tracking-[-0.02em] text-[#10131A]">
                지금 <span className="text-[#7962ED]">지원 가능한</span>
                <br />
                장학금을 확인해보세요!
              </h1>

              <span className="text-[16px] font-medium leading-[24px] text-[#555964]">
                위시커넥트가 추천하는 장학금을 확인해보세요.
              </span>
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

          {/* 로딩 */}
          {isLoading && (
            <div className="mt-[44px] flex h-[460px] items-center justify-center text-[16px] font-medium text-[#747883]">
              장학금을 불러오는 중이에요.
            </div>
          )}

          {/* 에러 */}
          {!isLoading && errorMessage && (
            <div className="mt-[44px] flex h-[460px] items-center justify-center text-[16px] font-medium text-[#747883]">
              {errorMessage}
            </div>
          )}

          {/* 카드 목록 */}
          {!isLoading && !errorMessage && (
            <div className="mt-[44px] grid grid-cols-3 gap-[32px]">
              {scholarships.map((scholarship) => (
                <article
                  key={scholarship.scholarshipId}
                  onClick={() => navigate(`/curation/${scholarship.scholarshipId}`)}
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
                      src={ArchivePost}
                      alt=""
                      className="block h-full w-full scale-[1.03] object-cover object-center"
                    />
                  )}

                  <div className="absolute bottom-0 left-0 h-[144px] w-full rounded-t-[16px] bg-white px-[24px] py-[24px]">
                    <div className="flex h-[32px] w-[278px] items-center gap-[8px]">
                      <DdayStatus days={scholarship.dDay ?? 0} />

                      <span className="text-[12px] font-medium leading-[16px] text-[#747883]">
                        {scholarship.deadline ?? '상시'}
                      </span>
                    </div>

                    <h2 className="mt-[8px] line-clamp-2 text-[20px] font-semibold leading-[28px] text-[#10131A]">
                      {scholarship.title}
                    </h2>

                    {/* 기존 태그 자리 유지 */}
                    <div className="mt-[4px] flex h-[24px] gap-[4px]">
                      {scholarship.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-[16px] px-[12px] py-[4px] shadow-[inset_0_0_0_0.781px_#E6E7EB]"
                        >
                          <span className="translate-y-[1px] text-[12px] font-medium leading-[16px] text-[#747883]">
                            #{tag}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!isLoading && !errorMessage && scholarships.length === 0 && (
            <div className="mt-[44px] flex h-[460px] items-center justify-center text-[16px] font-medium text-[#747883]">
              조회된 장학금이 없습니다.
            </div>
          )}

          {!isLoading && !errorMessage && scholarships.length > 0 && (
            <aside className="mt-[60px] flex items-center justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </aside>
          )}
        </main>
      </div>
    </div>
  );
}
