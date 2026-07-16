import { useState } from 'react';
import ChevronDown from '../../assets/icons/ChevronDown.svg';
import ChevronUp from '../../assets/icons/ChevronUp.svg';

interface FaqDropdownProps {
  question: string;
  answer: string;
}

export default function FaqDropdown({ question, answer }: FaqDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-[#D2D4DA]">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-[72px] w-full items-center justify-between py-[24px]"
      >
        <span className="text-[16px] font-medium leading-[24px] text-[#10131A]">{question}</span>

        <img src={isOpen ? ChevronUp : ChevronDown} alt="" className="h-[24px] w-[24px] shrink-0" />
      </button>

      {isOpen && (
        <div className="pb-[24px] pt-[18px]">
          <div className="rounded-[8px] bg-[#F9FAFC] px-[24px] py-[18px]">
            <p className="text-[16px] font-medium leading-[24px] text-[#747883]">{answer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
