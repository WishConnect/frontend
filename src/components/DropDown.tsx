import { useState, type ButtonHTMLAttributes } from 'react';

interface DropDownProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  label?: string;
  width?: string;
  className?: string;
  onChange?: (isActive: boolean) => void;
}

function ArrowIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={`transition-transform duration-150 ${isActive ? 'rotate-180' : ''}`}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="#9DA1AC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DropDown({
  label = 'Drop Down',
  width = '164px',
  className = '',
  onChange,
  ...props
}: DropDownProps) {
  // 클릭마다 default <-> active 토글. 외부에서 status를 받는 Select/SelectBox와 달리
  // 이건 "클릭하면 자기가 바뀐다"는 동작 자체가 요구사항이라 컴포넌트 내부에서 상태를 들고 있음.
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    const next = !isActive;
    setIsActive(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        inline-flex items-center gap-6
        rounded-lg
        bg-[#F9FAFC]
        pl-6 pr-3 py-3
        font-['Pretendard'] font-medium text-[16px] leading-6
        ${className}
      `}
      style={{ width }}
      {...props}
    >
      <span
        className={`text-[#9DA1AC] text-left ${isActive ? 'flex-1 min-w-0' : 'shrink-0 w-[76px]'}`}
      >
        {label}
      </span>
      <ArrowIcon isActive={isActive} />
    </button>
  );
}
