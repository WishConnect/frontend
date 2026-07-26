import { useState, type TextareaHTMLAttributes } from 'react';

interface TextField1Props extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  placeholder?: string;
  maxLength?: number;
  width?: string;
  height?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function TextField1({
  placeholder = '내가 수정한 내용',
  maxLength = 1000,
  width = '507px',
  height = '464px',
  className = '',
  value,
  onChange,
  ...props
}: TextField1Props) {
  const [internalValue, setInternalValue] = useState('');
  const text = value ?? internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    if (onChange) {
      onChange(next);
    } else {
      setInternalValue(next);
    }
  };

  return (
    <div
      className={`
        flex flex-col
        border border-[#D2D4DA] rounded-2xl
        px-6 py-7
        ${className}
      `}
      style={{ width, height }}
    >
      <textarea
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="
          flex-1 w-full resize-none
          bg-transparent
          font-['Pretendard'] font-medium text-[14px] leading-[22px]
          text-[#0A0C11] placeholder:text-[#9DA1AC]
          outline-none
          caret-[#7962ED]
        "
        {...props}
      />
      <div className="shrink-0 w-full text-right font-['Pretendard'] font-medium text-[14px] leading-[22px] text-[#9DA1AC]">
        {text.length.toLocaleString()} / {maxLength.toLocaleString()}자
      </div>
    </div>
  );
}
