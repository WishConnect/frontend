import type { ButtonHTMLAttributes } from 'react';
import { selectContainerStyle, selectTextStyle, type SelectStatus } from './selectTokens';

interface SelectBoxProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  status?: SelectStatus;
  className?: string;
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M13.3334 4L6.00008 11.3333L2.66675 8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SelectBox({
  label = 'Select Box',
  status = 'default',
  className = '',
  ...props
}: SelectBoxProps) {
  const isSelected = status === 'selected';

  return (
    <button
      type="button"
      className={`
        inline-flex items-center gap-3
        rounded-lg border
        pl-3 pr-6 py-3
        font-['Pretendard'] font-medium text-[16px] leading-6
        ${isSelected ? selectContainerStyle.selected : 'bg-white border-[#E6E7EB]'}
        ${className}
      `}
      {...props}
    >
      <span
        className={`
          flex items-center justify-center shrink-0
          w-5 h-5 rounded
          ${isSelected ? 'bg-[#7962ED]' : 'border border-[#E6E7EB]'}
        `}
      >
        {isSelected && <CheckIcon />}
      </span>
      <span className={isSelected ? selectTextStyle.selected : 'text-[#0A0C11]'}>{label}</span>
    </button>
  );
}
