import type { RecommendedScholarship } from '../../mock/memberCuration';
import Button from '../Button/Button';
import ButtonGroup from '../Button/ButtonGroup';
import ChevronRight from '../../assets/icons/ChevronRight';
import ScrapDisable from '../../assets/icons/ScrapDiasbled.svg';
import Scrap from '../../assets/icons/Scrap.svg';
import DdayStatus from '../../components/DdayStatus';

interface RecommendCardProps {
  scholarship: RecommendedScholarship;
  onPrev: () => void;
  onNext: () => void;
  onDetailClick: () => void;
}

export default function RecommendCard({
  scholarship,
  onPrev,
  onNext,
  onDetailClick,
}: RecommendCardProps) {
  return (
    <div className="flex h-[528px] w-[1043px] gap-[32px] rounded-[16px] pl-[56px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]">
      <div
        onClick={onPrev}
        className="flex h-[528px] w-[410px] cursor-pointer flex-col pt-[48px] pb-[42px]"
      >
        <DdayStatus days={scholarship.days} />

        <h2 className="mt-[24px] text-[28px] font-bold leading-[36px] text-[#10131A]">
          {scholarship.title}
        </h2>

        <div className="mt-[12px] flex gap-[8px]">
          {scholarship.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[16px] px-[10px] py-[4px] text-[12px] font-medium leading-[16px] text-[#747883] shadow-[inset_0_0_0_0.781px_#9DA1AC]"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-[24px] text-[16px] font-semibold leading-[24px] text-[#555964]">
          {scholarship.amount} | {scholarship.deadline} 마감
        </p>

        <p className="mt-[4px] text-[16px] font-medium leading-[24px] text-[#555964]">
          {scholarship.description}
        </p>

        <div className="mt-[20px] h-px w-full bg-[#D2D4DA]" />

        <h3 className="mt-[16px] text-[18px] font-bold leading-[28px] text-[#10131A]">
          이 장학금을 추천하는 이유
        </h3>

        <div className="mt-[12px] flex flex-col gap-[8px]">
          {scholarship.recommendReasons.map((reason) => (
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
            variant={scholarship.isScrapped ? 'primary' : 'disabled'}
            weight="medium"
            width="148px"
            paddingLeft="32px"
            paddingRight="32px"
            iconGap={13}
            leftIcon={
              <img
                src={scholarship.isScrapped ? Scrap : ScrapDisable}
                alt="스크랩"
                className="w-[14px] h-[17px]"
              />
            }
          >
            스크랩
          </Button>
        </ButtonGroup>
      </div>

      <img
        src={scholarship.image}
        alt={scholarship.title}
        onClick={onNext}
        className="h-[528px] w-[545px] cursor-pointer object-cover"
      />
    </div>
  );
}
