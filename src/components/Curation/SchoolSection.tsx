import { useState } from 'react';
import type { SchoolScholarship } from '../../mock/memberCuration';
import SchoolScholarshipCard from './SchoolCard';
import ChevronDown from '../../assets/icons/ChevronDown.svg';
import ChevronUp from '../../assets/icons/ChevronUp.svg';

interface SchoolScholarshipSectionProps {
  scholarships: SchoolScholarship[];
}

export default function SchoolScholarshipSection({ scholarships }: SchoolScholarshipSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const visibleScholarships = isOpen ? scholarships : scholarships.slice(0, 3);

  return (
    <section className="flex w-[1043px] flex-col gap-[24px]">
      {/* 카드 */}
      <div className="grid grid-cols-3 gap-x-[32px] gap-y-[16px]">
        {visibleScholarships.map((scholarship) => (
          <SchoolScholarshipCard key={scholarship.id} scholarship={scholarship} />
        ))}
      </div>

      {/* 토글 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-[56px] items-center justify-center gap-[8px] rounded-[8px] border border-[#D2D4DA] bg-white"
      >
        <span className="text-[16px] font-medium text-[#555964]">
          {isOpen ? '접기' : '전체 교내 장학금 보기'}
        </span>

        <img src={isOpen ? ChevronUp : ChevronDown} alt="" className="h-[20px] w-[20px]" />
      </button>
    </section>
  );
}
