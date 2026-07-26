import type { ReactNode } from 'react';

type TagVariant = 'primary' | 'outline' | 'pale';

interface TagProps {
    children: ReactNode;
    variant?: TagVariant;
}

export default function Tag({ children, variant = 'primary' }: TagProps) {
    const baseStyle = `
    inline-flex items-center justify-center 
    h-[24px] px-[12px] py-[4px] gap-[4px] 
    rounded-[16px] font-['Pretendard'] text-[12px] font-500`;

   const variantStyles = {
        primary: "bg-[#7962ED] text-white",
        outline: "bg-white border-[0.781px] border-[#9DA1AC] text-[#555964]",
        pale: "bg-[rgba(121,98,237,0.10)] border border-[#BDB9F9] text-[#320095]",
   };

   return (
    <span className={`${baseStyle} ${variantStyles[variant]}`}>
        {children}
    </span>
   );
}