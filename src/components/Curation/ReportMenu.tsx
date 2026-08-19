import { useEffect, useRef, useState } from 'react';
import Report from '../../assets/icons/Report.svg';

interface ReportMenuProps {
  onSelectReport: () => void;
  onSelectInquiry: () => void;
}

/**
 * 장학금 상세의 "신고하기" 토글과 드롭다운.
 *
 * 예전에는 저장하기·공유하기 옆에 신고하기 버튼이 하나 있었는데, 시안(3345:7681)에서
 * 제목 줄 오른쪽으로 옮기고 신고하기 / 이용문의 두 갈래를 여는 토글로 바뀌었다.
 */
export default function ReportMenu({ onSelectReport, onSelectInquiry }: ReportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // 바깥을 누르면 닫는다. 열려 있을 때만 리스너를 건다.
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 고른 뒤에는 닫아 둔다. 모달이 뜬 채로 드롭다운이 남아 있으면 어색하다.
  const select = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative shrink-0" ref={boxRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex h-[40px] w-[121px] items-center gap-[6px] rounded-[8px] bg-[#F3F4F6] pl-[16px] text-[14px] font-medium leading-[20px] text-[#747883]"
      >
        <img src={Report} alt="" className="h-[16px] w-[16px]" />
        <span>신고하기</span>
        {/* 열림/닫힘에 따라 화살표를 뒤집는다 */}
        <svg
          width="12"
          height="6"
          viewBox="0 0 12 6"
          fill="none"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path
            d="M1 1L6 5L11 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        // 항목 사이 테두리가 겹쳐 두 줄로 보이지 않게 -mt-px 로 1px 씩 물린다(시안도 itemSpacing -1).
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+7px)] z-20 w-[121px] shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => select(onSelectReport)}
            className="flex h-[40px] w-full items-center rounded-t-[8px] border border-[#E6E7EB] bg-white pl-[16px] text-left text-[14px] font-medium leading-[20px] text-[#555964] hover:bg-[#F9FAFC]"
          >
            신고하기
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => select(onSelectInquiry)}
            className="-mt-px flex h-[40px] w-full items-center rounded-b-[8px] border border-[#E6E7EB] bg-white pl-[16px] text-left text-[14px] font-medium leading-[20px] text-[#555964] hover:bg-[#F9FAFC]"
          >
            이용문의
          </button>
        </div>
      )}
    </div>
  );
}
