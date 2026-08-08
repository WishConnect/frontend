import { useState } from 'react';

import SchoolScholarshipCard from './SchoolCard';

import ChevronDown from '../../assets/icons/ChevronDown.svg';
import ChevronUp from '../../assets/icons/ChevronUp.svg';

import type { CuratedCampusScholarship } from '../../types/Curation/Curated';

interface SchoolScholarshipSectionProps {
  scholarships: CuratedCampusScholarship[];
  onDetailClick: (scholarshipId: number) => void;
}

export default function SchoolScholarshipSection({
  scholarships,
  onDetailClick,
}: SchoolScholarshipSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const visibleScholarships = isOpen ? scholarships : scholarships.slice(0, 3);

  if (scholarships.length === 0) {
    return (
      <section className="flex h-[224px] w-[1043px] items-center justify-center rounded-[16px] border border-[#D2D4DA] bg-white">
        <p className="text-[16px] font-medium text-[#747883]">조회된 교내 장학금이 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="flex w-[1043px] flex-col gap-[24px]">
      <div className="grid grid-cols-3 gap-x-[32px] gap-y-[16px]">
        {visibleScholarships.map((scholarship) => (
          <SchoolScholarshipCard
            key={scholarship.scholarshipId}
            scholarship={scholarship}
            onClick={() => onDetailClick(scholarship.scholarshipId)}
          />
        ))}
      </div>

      {scholarships.length > 3 && (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-[56px] items-center justify-center gap-[8px] rounded-[8px] border border-[#D2D4DA] bg-white"
        >
          <span className="text-[16px] font-medium text-[#555964]">
            {isOpen ? '접기' : '전체 교내 장학금 보기'}
          </span>

          <img src={isOpen ? ChevronUp : ChevronDown} alt="" className="h-[20px] w-[20px]" />
        </button>
      )}
    </section>
  );
}
