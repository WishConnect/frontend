import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonVariant = 'outline' | 'primary' | 'gradient' | 'disabled';
type ButtonWeight = 'medium' | 'semibold' | 'bold';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  weight?: ButtonWeight;
  width?: string;
  paddingLeft?: string;
  paddingRight?: string;
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconGap?: number;
}

const sizeStyle = {
  sm: 'h-9 py-2 text-[14px]',
  md: 'h-12 py-4 text-[18px]',
  lg: 'h-[60px] py-4 text-[20px]',
};

const variantStyle = {
  outline: 'border border-[#9DA1AC] bg-white text-[#555964]',
  primary: 'bg-[#7962ED] text-white',
  gradient: 'bg-gradient-to-r from-[#7962ED] to-[#BDB9F9] text-white',
  disabled: 'bg-[#F3F4F6] text-[#9DA1AC] cursor-not-allowed',
};

const weightStyle = {
  medium: 'font-medium', // 500
  semibold: 'font-semibold', // 600
  bold: 'font-bold', // 700
};

export default function Button({
  size = 'md',
  variant = 'primary',
  weight = 'medium',
  width,
  children,
  paddingLeft = '16px',
  paddingRight = '16px',
  leftIcon,
  rightIcon,
  iconGap = 8,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || variant === 'disabled';

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center
        rounded-lg
        font-['Pretendard']
        ${weightStyle[weight]}
        ${sizeStyle[size]}
        ${variantStyle[isDisabled ? 'disabled' : variant]}
        ${className}
      `}
      style={{
        width,
        paddingLeft,
        paddingRight,
        gap: leftIcon || rightIcon ? `${iconGap}px` : undefined,
      }}
      {...props}
    >
      {leftIcon}
      <span className="whitespace-nowrap">{children}</span>
      {rightIcon}
    </button>
  );
}
