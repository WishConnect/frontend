import { useState } from 'react';
import SortDropdown from '../../assets/icons/arrowdown.svg';
import { scholarships } from '../../mock/scholarships';

const ITEMS_PER_PAGE = 9;

export default function GuestCurationPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const sortedScholarships = [...scholarships].sort((a, b) => {
    const aDay = Number(a.dDay.replace('D-', ''));
    const bDay = Number(b.dDay.replace('D-', ''));

    return aDay - bDay;
  });

  const totalPages = Math.ceil(sortedScholarships.length / ITEMS_PER_PAGE);

  const currentScholarships = sortedScholarships.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="h-[1024px] w-[1440px] bg-white font-['Pretendard']">
      <header className="h-[80px]">{/* 공통 Header */}</header>

      <div className="flex">
        <aside className="w-[237px]">{/* 공통 Sidebar */}</aside>

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

            <img src={SortDropdown} alt="정렬" className="h-[48px] w-[164px] cursor-pointer" />
          </div>

          {/* 카드 목록 */}
          <div className="mt-[44px] grid grid-cols-3 gap-[32px]">
            {currentScholarships.map((scholarship) => (
              <article
                key={scholarship.id}
                className="relative h-[460px] w-[326px] cursor-pointer overflow-hidden rounded-[16px] border border-[#E6E7EB]"
              >
                <img
                  src={scholarship.posterImage}
                  alt={scholarship.title}
                  className="h-full w-[326px] object-cover"
                />

                <div className="absolute bottom-0 left-0 h-[144px] w-full rounded-t-[16px] bg-white px-[24px] py-[24px]">
                  <div className="flex h-[32px] w-[278px] items-center gap-[8px]">
                    <span
                      className={`flex h-[32px] w-[55px] items-center justify-center whitespace-nowrap rounded-[8px] px-[15px] text-[14px] font-bold text-white ${
                        scholarship.dDay === 'D-5' ? 'bg-[#FF5B64]' : 'bg-[#FFC940]'
                      }`}
                    >
                      {scholarship.dDay}
                    </span>

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

          {/* Pagination (임시) */}
          <aside className="mt-[60px] flex items-center justify-center">
            <div className="flex h-[24px] items-center">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="flex h-[24px] w-[24px] items-center justify-center text-[14px] text-[#7962ED] disabled:text-[#D2D4DA]"
              >
                {'<'}
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-[24px] w-[24px] items-center justify-center text-[14px] font-medium ${
                    page === currentPage
                      ? 'rounded-[4px] bg-[#7962ED] text-white'
                      : 'text-[#555964]'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="flex h-[24px] w-[24px] items-center justify-center text-[14px] text-[#7962ED] disabled:text-[#D2D4DA]"
              >
                {'>'}
              </button>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
