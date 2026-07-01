import type { ButtonHTMLAttributes } from 'react';
import { selectContainerStyle, selectTextStyle, type SelectStatus } from './selectTokens';

interface SelectProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  status?: SelectStatus;
  width?: string;
  className?: string;
}

export default function Select({
  label = 'Select',
  status = 'default',
  width,
  className = '',
  ...props
}: SelectProps) {
  const isSelected = status === 'selected';

  return (
    <button
      type="button"
      className={`
        inline-flex items-center
        rounded-lg border
        px-6 py-3
        font-['Pretendard'] font-medium text-[16px] leading-6
        ${selectContainerStyle[status]}
        ${className}
      `}
      style={{ width }}
      {...props}
    >
      <span
        className={`
          flex-1 min-w-0
          ${selectTextStyle[status]}
          ${isSelected ? 'text-center' : 'text-left'}
        `}
      >
        {label}
      </span>
    </button>
  );
}
