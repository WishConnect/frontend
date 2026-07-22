import { useState } from 'react';
import Down from '../../assets/icons/CategoryDown.svg';
import Up from '../../assets/icons/CategoryUp.svg';
import { scholarships } from '../../mock/scholarships';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar';
import DdayStatus from '../../components/DdayStatus';
import Pagination from '../../components/common/Pagination/Pagination';

const ITEMS_PER_PAGE = 9;

type SortOption = '마감 임박순' | '최신순' | '높은 금액순';

export default function GuestCurationPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>('마감 임박순');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortOptions: SortOption[] = ['마감 임박순', '최신순', '높은 금액순'];

  const sortedScholarships = [...scholarships].sort((a, b) => {
    if (sortOption === '마감 임박순') {
      return a.days - b.days;
    }

    if (sortOption === '높은 금액순') {
      const aAmount = Number(a.summary.amount.replace(/[^0-9]/g, ''));
      const bAmount = Number(b.summary.amount.replace(/[^0-9]/g, ''));
      return bAmount - aAmount;
    }

    return 0;
  });

  const totalPages = Math.ceil(sortedScholarships.length / ITEMS_PER_PAGE);

  const currentScholarships = sortedScholarships.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const navigate = useNavigate();
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
        <div className="relative ml-[64px] h-[896px] w-[237px] shrink-0 self-start">
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

          {/* 카드 목록 */}
          <div className="mt-[44px] grid grid-cols-3 gap-[32px]">
            {currentScholarships.map((scholarship) => (
              <article
                key={scholarship.id}
                onClick={() => navigate(`/curation/${scholarship.id}`)}
                className="relative h-[460px] w-[326px] cursor-pointer overflow-hidden rounded-[16px] border border-[#E6E7EB]"
              >
                <img
                  src={scholarship.posterImage}
                  alt={scholarship.title}
                  className="h-full w-[326px] object-cover"
                />

                <div className="absolute bottom-0 left-0 h-[144px] w-full rounded-t-[16px] bg-white px-[24px] py-[24px]">
                  <div className="flex h-[32px] w-[278px] items-center gap-[8px]">
                    <DdayStatus days={scholarship.days} />

                    <span className="text-[12px] font-medium leading-[16px] text-[#747883]">
                      {scholarship.deadline}
                    </span>
                  </div>

                  <h2 className="mt-[8px] line-clamp-2 text-[20px] font-semibold leading-[28px] text-[#10131A]">
                    {scholarship.title}
                  </h2>

                  <div className="mt-[4px] flex h-[24px] gap-[4px]">
                    {scholarship.tags.slice(0, 3).map((tag) => (
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

          <aside className="mt-[60px] flex items-center justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </aside>
        </main>
      </div>
    </div>
  );
}
