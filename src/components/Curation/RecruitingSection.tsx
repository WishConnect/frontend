import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChevronDown from '../../assets/icons/ChevronDown.svg';
import ChevronUp from '../../assets/icons/ChevronUp.svg';
import ScrapDisable from '../../assets/icons/ScrapDiasbled.svg';
import ScrapEnable from '../../assets/icons/ScrapEnable.svg';
import type { CuratedOtherScholarship } from '../../types/Curation/Curated';

import { scrapScholarship, unscrapScholarship } from '../../api/Curation/Scrap';

interface RecruitingSectionProps {
  scholarships: CuratedOtherScholarship[];
}

export default function RecruitingSection({ scholarships }: RecruitingSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [scrappedIds, setScrappedIds] = useState<number[]>(() =>
    scholarships
      .filter((scholarship) => scholarship.isScrapped === true)
      .map((scholarship) => scholarship.scholarshipId),
  );
  const navigate = useNavigate();

  const handleDetailClick = (scholarshipId: number) => {
    navigate(`/curation/${scholarshipId}`);
  };
  const handleScrap = async (scholarshipId: number) => {
    if (loadingId !== null) {
      return;
    }

    const isCurrentlyScrapped = scrappedIds.includes(scholarshipId);

    try {
      setLoadingId(scholarshipId);

      const result = isCurrentlyScrapped
        ? await unscrapScholarship(scholarshipId)
        : await scrapScholarship(scholarshipId);

      setScrappedIds((prev) => {
        if (result.scrapped) {
          return prev.includes(scholarshipId) ? prev : [...prev, scholarshipId];
        }

        return prev.filter((id) => id !== scholarshipId);
      });
    } catch (error) {
      console.error('장학금 스크랩 상태 변경 실패:', error);

      alert(error instanceof Error ? error.message : '스크랩 상태 변경에 실패했습니다.');
    } finally {
      setLoadingId(null);
    }
  };

  const visibleScholarships = isOpen ? scholarships : scholarships.slice(0, 4);

  if (scholarships.length === 0) {
    return (
      <section className="flex h-[160px] w-[1043px] items-center justify-center border-y border-[#D2D4DA]">
        <p className="text-[16px] font-medium text-[#747883]">조회된 장학금이 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="flex w-[1043px] flex-col">
      <div className="mt-[16px] flex h-[16px] items-center border-b border-[#D2D4DA] pb-[12px] text-[12px] font-medium leading-[16px] text-[#555964]">
        <div className="w-[413px]" />

        <div className="w-[180px] text-center">최대 금액</div>

        <div className="w-[180px] text-center">마감일</div>

        <div className="w-[270px] text-center">기관</div>
      </div>

      <div className="flex flex-col">
        {visibleScholarships.map((scholarship) => {
          const isScrapped = scrappedIds.includes(scholarship.scholarshipId);

          const isLoading = loadingId === scholarship.scholarshipId;

          const amountText = scholarship.maxAmount ?? '금액 정보 없음';

          const deadlineText = scholarship.deadline ?? '상시';

          const dDayText = scholarship.dDay !== null ? `D-${scholarship.dDay}` : '';

          return (
            <div
              key={scholarship.scholarshipId}
              role="button"
              tabIndex={0}
              onClick={() => handleDetailClick(scholarship.scholarshipId)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleDetailClick(scholarship.scholarshipId);
                }
              }}
              className="flex h-[64px] cursor-pointer items-center border-b border-[#D2D4DA] pt-[20px] pb-[20px]"
            >
              <div className="flex w-[413px] items-center">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleScrap(scholarship.scholarshipId);
                  }}
                  className="ml-[23px] mr-[20px] flex h-[20px] w-[20px] items-center justify-center disabled:cursor-not-allowed"
                >
                  <img
                    src={isScrapped ? ScrapEnable : ScrapDisable}
                    alt={isScrapped ? '스크랩 해제' : '장학금 스크랩'}
                    className="h-[20px] w-[20px] shrink-0"
                  />
                </button>

                <span className="mr-[12px] overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-semibold leading-[24px] text-[#10131A]">
                  {scholarship.title}
                </span>
              </div>

              <div className="w-[180px] text-center text-[14px] font-medium leading-[20px] text-[#555964]">
                {amountText}
              </div>

              <div className="w-[180px] text-center text-[14px] font-medium leading-[20px] text-[#555964]">
                {deadlineText}
                {dDayText && ` (${dDayText})`}
              </div>

              <div className="w-[270px] text-center text-[14px] font-medium leading-[20px] text-[#555964]">
                {scholarship.organization}
              </div>
            </div>
          );
        })}
      </div>

      {scholarships.length > 4 && (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="mt-[16px] flex h-[56px] items-center justify-center gap-[8px] rounded-[8px] border border-[#D2D4DA] bg-white"
        >
          <span className="text-[16px] font-medium text-[#555964]">
            {isOpen ? '접기' : '더 많은 장학금 보기'}
          </span>

          <img src={isOpen ? ChevronUp : ChevronDown} alt="" className="h-[20px] w-[20px]" />
        </button>
      )}
    </section>
  );
}
