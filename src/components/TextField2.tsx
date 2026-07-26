import { useState, type TextareaHTMLAttributes } from 'react';

interface TextField2Props extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  placeholder?: string;
  maxLength?: number;
  width?: string;
  height?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function TextField2({
  placeholder = '여기에 입력하세요.',
  maxLength = 500,
  width,
  height = '141px',
  className = '',
  value,
  onChange,
  ...props
}: TextField2Props) {
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
        border border-[#D2D4DA] rounded-lg
        px-4 py-3
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
          font-['Pretendard'] font-medium text-[12px] leading-4
          text-[#0A0C11] placeholder:text-[#9DA1AC]
          outline-none
          caret-[#7962ED]
        "
        {...props}
      />
      <div className="shrink-0 w-full text-right font-['Pretendard'] font-medium text-[12px] leading-4 text-[#9DA1AC]">
        {text.length}/{maxLength}
      </div>
    </div>
  );
}
