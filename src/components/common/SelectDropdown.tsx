import { useEffect, useRef, useState } from 'react';

interface SelectDropdownProps {
  options: string[]; // 선택지 목록
  value: string; // 현재 선택값 (빈 문자열이면 미선택)
  onChange: (value: string) => void;
  placeholder?: string; // 미선택일 때 보여줄 문구
  width?: string;
  className?: string;
}

// 실제로 값을 고를 수 있는 드롭다운.
// 기존 components/DropDown은 열림/닫힘만 토글할 뿐 선택지도 선택값 전달도 없는데,
// 남의 페이지(Insight/MoreInfo)에서 이미 쓰고 있어 손대지 않고 같은 디자인으로 새로 만들었다.
export default function SelectDropdown({
  options,
  value,
  onChange,
  placeholder = '선택해 주세요',
  width = '595px',
  className = '',
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 목록 바깥을 클릭하면 닫기. 열려 있을 때만 리스너를 붙인다.
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative" style={{ width }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          inline-flex w-full items-center gap-6
          rounded-lg bg-[#F9FAFC]
          pl-6 pr-3 py-3
          font-['Pretendard'] font-medium text-[16px] leading-6
          ${className}
        `}
      >
        {/* 선택 전엔 회색 안내문구, 선택 후엔 진한 본문색 */}
        <span className={`flex-1 min-w-0 text-left ${value ? 'text-[#0A0C11]' : 'text-[#9DA1AC]'}`}>
          {value || placeholder}
        </span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className={`shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="#9DA1AC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 선택지 목록: 버튼 바로 아래에 겹쳐 띄우고 길면 스크롤(출생년도처럼 항목이 많은 경우) */}
      {isOpen && (
        <ul className="absolute left-0 top-[calc(100%+4px)] z-20 max-h-[240px] w-full overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white py-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => handleSelect(option)}
                className={`
                  w-full px-6 py-3 text-left
                  font-['Pretendard'] font-medium text-[16px] leading-6
                  hover:bg-[#F4F4FE]
                  ${option === value ? 'bg-[#F4F4FE] text-[#7962ED]' : 'text-[#0A0C11]'}
                `}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
