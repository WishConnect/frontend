import Button from '../Button/Button';

import type { CuratedCampusScholarship } from '../../types/Curation/Curated';
import { formatScholarshipAmount } from '../../utils/scholarshipAmount';

interface SchoolScholarshipCardProps {
  scholarship: CuratedCampusScholarship;
  onClick: () => void;
}

export default function SchoolCard({ scholarship, onClick }: SchoolScholarshipCardProps) {
  const amountText = formatScholarshipAmount(scholarship.title, scholarship.maxAmount);

  const deadlineText = scholarship.deadline ? `${scholarship.deadline} 마감` : '마감일 정보 없음';

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onClick();
        }
      }}
      className="relative flex h-[224px] w-[326px] cursor-pointer flex-col rounded-[16px] border border-[#D2D4DA] bg-white px-[32px] pt-[32px] pb-[48px]"
    >
      <Button
        width="63px"
        size="sm"
        variant="gradient"
        paddingLeft="16px"
        paddingRight="16px"
        weight="semibold"
        className="pointer-events-none leading-[20px]"
      >
        {scholarship.dDay !== null ? `D-${scholarship.dDay}` : '상시'}
      </Button>

      <h3 className="mt-[16px] h-[40px] overflow-hidden text-[28px] font-bold leading-[40px] text-[#10131A]">
        {scholarship.title}
      </h3>

      <p className="mt-[8px] h-[24px] overflow-hidden text-[16px] font-semibold leading-[24px] text-[#555964]">
        {amountText} | {deadlineText}
      </p>

      <p className="overflow-hidden text-[16px] font-medium leading-[24px] text-[#555964]">
        {scholarship.organization}
      </p>
    </article>
  );
}
