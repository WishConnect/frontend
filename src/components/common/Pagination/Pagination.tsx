interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const DOTS = '...';

// 페이지 번호 목록 생성 — 현재 페이지 주변만 보여주고 멀리 떨어진 페이지는 '...'으로 생략
// (숨기는 페이지가 1개뿐이면 생략하지 않고 그냥 보여줌 → 앞/뒤 끝에서는 5개씩 뭉쳐서 표시)
function getPageNumbers(currentPage: number, totalPages: number): (number | typeof DOTS)[] {
  const siblingCount = 1;
  const windowSize = siblingCount * 2 + 3; // 5

  if (totalPages <= windowSize + 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  let start = currentPage - siblingCount;
  let end = currentPage + siblingCount;

  if (start <= 3) {
    start = 1;
    end = windowSize;
  } else if (end >= totalPages - 2) {
    end = totalPages;
    start = totalPages - windowSize + 1;
  }

  const pages: (number | typeof DOTS)[] = [];
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push(DOTS);
  }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push(DOTS);
    pages.push(totalPages);
  }
  return pages;
}

// 화살표 아이콘 — direction="right"일 때 좌우 반전
function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={direction === 'right' ? 'rotate-180' : ''}
    >
      <path
        d="M10 12L6 8L10 4"
        stroke="#747883"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 숫자 페이지네이션 — 리스트 하단 페이지 이동에 사용
export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center gap-[12px]">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center size-[28px] disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="이전 페이지"
      >
        <ChevronIcon direction="left" />
      </button>

      <div className="flex items-center gap-[4px]">
        {pages.map((page, index) =>
          page === DOTS ? (
            <span
              key={`dots-${index}`}
              className="flex items-center justify-center size-[28px] text-[16px] text-[#747883]"
            >
              {DOTS}
            </span>
          ) : (
            <button
              type="button"
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex items-center justify-center size-[28px] rounded-[4px] text-[16px] font-medium ${
                page === currentPage ? 'bg-[#7962ED] text-white' : 'text-[#747883]'
              }`}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center size-[28px] disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="다음 페이지"
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}
