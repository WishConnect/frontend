import type { MouseEvent } from 'react';

import Button from '../Button/Button';
import ButtonGroup from '../Button/ButtonGroup';
import ChevronRight from '../../assets/icons/ChevronRight';
import ScrapDisable from '../../assets/icons/ScrapDiasbled.svg';
import Scrap from '../../assets/icons/Scrap.svg';
import DdayStatus from '../DdayStatus';
import MainPost from './MainPost.svg';

import type { CuratedFeaturedScholarship } from '../../types/Curation/Curated';

interface RecommendCardProps {
  scholarship: CuratedFeaturedScholarship;
  onDetailClick: () => void;
  onScrapClick: (scholarshipId: number) => void;
  onPrev: () => void;
  onNext: () => void;
  isScrapLoading?: boolean;
}

export default function RecommendCard({
  scholarship,
  onDetailClick,
  onScrapClick,
  onPrev,
  onNext,
  isScrapLoading = false,
}: RecommendCardProps) {
  const isScrapped = scholarship.isScrapped;
  const tags = scholarship.tags ?? [];
  const matchReasons = scholarship.matchReasons ?? [];

  const handleCardClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    // 상세보기·스크랩 버튼 클릭 시에는 캐러셀을 이동하지 않음
    if (target.closest('button, a')) {
      return;
    }

    const cardRect = event.currentTarget.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2;

    if (event.clientX < cardCenterX) {
      onPrev();
      return;
    }

    onNext();
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex h-[528px] w-[1043px] gap-[32px] rounded-[16px] pl-[56px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]"
    >
      <div className="flex h-[528px] w-[410px] flex-col pt-[48px] pb-[42px]">
        <DdayStatus days={scholarship.dDay ?? 0} />

        <h2 className="mt-[24px] text-[28px] font-bold leading-[36px] text-[#10131A]">
          {scholarship.title}
        </h2>

        {tags.length > 0 && (
          <div className="mt-[12px] flex flex-wrap gap-[8px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-[16px] px-[10px] py-[4px] text-[12px] font-medium leading-[16px] text-[#747883] shadow-[inset_0_0_0_0.781px_#9DA1AC]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="mt-[24px] text-[16px] font-semibold leading-[24px] text-[#555964]">
          {scholarship.maxAmount ?? '금액 정보 없음'} |{' '}
          {scholarship.deadline ? `${scholarship.deadline} 마감` : '마감일 정보 없음'}
        </p>

        <p className="mt-[4px] text-[16px] font-medium leading-[24px] text-[#555964]">
          {scholarship.organization}
        </p>

        <div className="mt-[20px] h-px w-full bg-[#D2D4DA]" />

        <h3 className="mt-[16px] text-[18px] font-bold leading-[28px] text-[#10131A]">
          이 장학금을 추천하는 이유
        </h3>

        <div className="mt-[12px] flex flex-col gap-[8px]">
          {matchReasons.map((reason) => (
            <span key={reason} className="text-[14px] font-medium leading-[20px] text-[#555964]">
              ✓ {reason}
            </span>
          ))}
        </div>

        <ButtonGroup className="mt-[32px]">
          <Button
            size="md"
            variant="primary"
            weight="medium"
            width="148px"
            iconGap={16}
            paddingLeft="32px"
            paddingRight="16px"
            rightIcon={<ChevronRight />}
            onClick={onDetailClick}
          >
            상세보기
          </Button>

          <Button
            size="md"
            variant={isScrapped ? 'primary' : 'inactive'}
            weight="medium"
            width="148px"
            paddingLeft="32px"
            paddingRight="32px"
            iconGap={13}
            disabled={isScrapLoading}
            leftIcon={
              <img src={isScrapped ? Scrap : ScrapDisable} alt="" className="h-[17px] w-[14px]" />
            }
            onClick={() => {
              onScrapClick(scholarship.scholarshipId);
            }}
          >
            {isScrapLoading ? '처리 중' : '스크랩'}
          </Button>
        </ButtonGroup>
      </div>

      <div className="h-[528px] w-[545px] overflow-hidden rounded-r-[16px] bg-[#F3F4F6]">
        {scholarship.thumbnailUrl ? (
          <img
            src={scholarship.thumbnailUrl}
            alt={scholarship.title}
            className="block h-full w-full object-cover object-center"
          />
        ) : (
          <img
            src={MainPost}
            alt=""
            className="block h-full w-full scale-[1.03] object-cover object-center"
          />
        )}
      </div>
    </div>
  );
}
