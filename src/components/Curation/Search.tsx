import DdayStatus from '../DdayStatus';
import Tag from '../Tag';
import Button from '../Button/Button';
import Scrap from '../../assets/icons/ScrapCircle.svg';
import ScrapDisabled from '../../assets/icons/ScrapCircleDisable.svg';

interface SearchScholarshipRowProps {
  scholarship: {
    id: number;
    title: string;
    days: number; // dDay, deadlineStatus 대신
    deadline: string;
    tags: string[];
    isScrapped: boolean;
    summary: {
      amount: string;
      organization: string;
      applicationPeriod: string;
    };
  };
}

export default function SearchScholarshipRow({ scholarship }: SearchScholarshipRowProps) {
  return (
    <article className="flex h-[144px] w-full border-b border-[#D2D4DA] last:border-b-0">
      <div className="flex w-[600px] flex-col justify-center pl-[32px]">
        <div className="flex items-center gap-[8px]">
          <DdayStatus days={scholarship.days} />

          <span className="text-[14px] font-medium text-[#747883]">•</span>

          <span className="text-[14px] font-medium text-[#747883]">
            {scholarship.summary.organization}
          </span>
        </div>

        <h2 className="mt-[12px] text-[20px] font-bold leading-[28px] text-[#10131A]">
          {scholarship.title}
        </h2>

        <div className="mt-[8px] flex gap-[6px]">
          {scholarship.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} variant="outline">
              {tag}
            </Tag>
          ))}
        </div>
      </div>

      <div className="my-[24px] w-px bg-[#D2D4DA]" />

      <div className="flex w-[240px] flex-col justify-center pl-[24px]">
        <p className="text-[14px] font-medium leading-[20px] text-[#747883]">지원금액</p>
        <p className="text-[16px] font-bold leading-[24px] text-[#10131A]">
          {scholarship.summary.amount}
        </p>

        <p className="mt-[16px] text-[14px] font-medium leading-[20px] text-[#747883]">모집 기간</p>
        <p className="text-[16px] font-bold leading-[24px] text-[#10131A]">
          {scholarship.summary.applicationPeriod}
        </p>
      </div>

      <div className="flex flex-1 flex-col items-end justify-center pr-[32px]">
        <img
          src={scholarship.isScrapped ? Scrap : ScrapDisabled}
          alt="스크랩"
          className="mb-[28px] h-[32px] w-[32px]"
        />

        <Button size="sm" variant="primary" width="126px" weight="semibold">
          장학금 상세보기
        </Button>
      </div>
    </article>
  );
}
