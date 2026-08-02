import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { scrapScholarship, unscrapScholarship } from '../../api/Curation/Scrap';

import DdayStatus from '../DdayStatus';
import Tag from '../Tag';
import Button from '../Button/Button';

import Scrap from '../../assets/icons/ScrapCircle.svg';
import ScrapDisabled from '../../assets/icons/ScrapCircleDisable.svg';

import type { SearchScholarshipRowData } from '../../types/Curation/Search';

interface SearchScholarshipRowProps {
  scholarship: SearchScholarshipRowData;
}

export default function SearchScholarshipRow({ scholarship }: SearchScholarshipRowProps) {
  const navigate = useNavigate();
  const [isScrapped, setIsScrapped] = useState(scholarship.isScrapped);
  const [isScrapLoading, setIsScrapLoading] = useState(false);
  const handleDetailClick = () => {
    navigate(`/curation/${scholarship.id}`);
  };
  const handleScrapClick = async () => {
    if (isScrapLoading) {
      return;
    }

    try {
      setIsScrapLoading(true);

      if (isScrapped) {
        await unscrapScholarship(scholarship.id);
        setIsScrapped(false);
      } else {
        await scrapScholarship(scholarship.id);
        setIsScrapped(true);
      }
    } catch (error) {
      console.error('장학금 스크랩 변경 실패:', error);

      alert(error instanceof Error ? error.message : '스크랩 상태 변경에 실패했습니다.');
    } finally {
      setIsScrapLoading(false);
    }
  };
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
          {scholarship.tags.slice(0, 3).map((tag, index) => (
            <Tag key={`${scholarship.id}-${tag}-${index}`} variant="outline">
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
        <button
          type="button"
          onClick={handleScrapClick}
          disabled={isScrapLoading}
          aria-label={isScrapped ? '장학금 스크랩 해제' : '장학금 스크랩'}
          className="mb-[28px] h-[32px] w-[32px] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <img src={isScrapped ? Scrap : ScrapDisabled} alt="" className="h-[32px] w-[32px]" />
        </button>

        <Button
          size="sm"
          variant="primary"
          width="126px"
          weight="medium"
          onClick={handleDetailClick}
        >
          장학금 상세보기
        </Button>
      </div>
    </article>
  );
}
