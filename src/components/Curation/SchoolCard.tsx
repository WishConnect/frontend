import type { SchoolScholarship } from '../../mock/memberCuration';
import Button from '../Button/Button';

interface SchoolScholarshipCardProps {
  scholarship: SchoolScholarship;
}

export default function SchoolCard({ scholarship }: SchoolScholarshipCardProps) {
  return (
    <article className="relative flex h-[224px] w-[326px] flex-col rounded-[16px] border border-[#D2D4DA] bg-white px-[32px] pt-[32px] pb-[48px]">
      {/* D-Day */}

      <Button
        width="63px"
        size="sm"
        variant="gradient"
        paddingLeft="16px"
        paddingRight="16px"
        weight="semibold"
        className="leading-[20px]"
      >
        {scholarship.dDay}
      </Button>

      <h3 className="mt-[16px] h-[40px] text-[28px] font-bold leading-[40px] text-[#10131A]">
        {scholarship.title}
      </h3>

      <p className="mt-[8px] text-[16px] h-[24px] font-semibold leading-[24px] text-[#555964]">
        {scholarship.amount} | {scholarship.deadline} 마감
      </p>

      <p className="text-[16px] font-medium leading-[24px] text-[#555964]">
        {scholarship.description}
      </p>
    </article>
  );
}
