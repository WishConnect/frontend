import type { TextareaHTMLAttributes } from 'react';

interface TextField3Props extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  width?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function TextField3({
  placeholder = 'Text Field',
  width = '117px',
  className = '',
  onChange,
  ...props
}: TextField3Props) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div
      className={`
        inline-flex items-center
        bg-[#F9FAFC] rounded-lg
        px-6 py-3
        ${className}
      `}
      style={{ width }}
    >
      <textarea
        rows={2}
        placeholder={placeholder}
        onChange={handleChange}
        className="
          flex-1 min-w-0 resize-none overflow-hidden
          bg-transparent
          font-['Pretendard'] font-medium text-[16px] leading-6
          text-[#0A0C11] placeholder:text-[#9DA1AC]
          outline-none border-none
          caret-[#7962ED]
        "
        {...props}
      />
    </div>
  );
}
