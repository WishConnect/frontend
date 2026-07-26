import GiftIcon from '../../assets/icons/Gift.svg';
import ClockIcon from '../../assets/icons/Clock.svg';
import FolderIcon from '../../assets/icons/Folder.svg';
import InsightIcon from '../../assets/icons/NewInsight.svg';

interface HomeSummaryCardsProps {
  isOnboarded: boolean;
  newMatchedCount: number;
  urgentDeadlineCount: number;
  applicationCount?: number;
  newInsightCount?: number;
  onLockedClick?: () => void;
}

export default function HomeSummaryCards({
  isOnboarded,
  newMatchedCount,
  urgentDeadlineCount,
  applicationCount = 0,
  newInsightCount = 0,
  onLockedClick,
}: HomeSummaryCardsProps) {
  const summaryItems = [
    {
      id: 1,
      label: '새로운 맞춤 장학금',
      count: newMatchedCount,
      icon: GiftIcon,
    },
    {
      id: 2,
      label: '이번 주 마감 장학금',
      count: urgentDeadlineCount,
      icon: ClockIcon,
    },
    {
      id: 3,
      label: '작성 중인 지원서',
      count: applicationCount,
      icon: FolderIcon,
    },
    {
      id: 4,
      label: '새로운 인사이트',
      count: newInsightCount,
      icon: InsightIcon,
    },
  ];

  return (
    <section className="flex h-[256px] w-[1222px] flex-col rounded-[16px] bg-[#F9FAFC] px-[36px] py-[24px]">
      <h2 className="h-[32px] w-[180px] text-[24px] font-bold leading-[32px] text-[#320095]">
        오늘의 장학금 소식
      </h2>

      <div className="relative mt-[16px] flex flex-1">
        {/* 실제 카드 내용 */}
        <div className={`grid grid-cols-4 gap-[28px] ${!isOnboarded ? 'pointer-events-none' : ''}`}>
          {summaryItems.map((item) => (
            <article
              key={item.id}
              className="flex h-[160px] w-[266px] flex-col rounded-[8px] bg-white px-[28px] py-[20px]"
            >
              {/* 아이콘 + 개수 */}
              <div className="flex h-[74px] w-full items-end justify-between">
                <img src={item.icon} alt="" className="h-[74px] w-[76px] shrink-0 object-contain" />

                <div className="flex h-[40px] items-end gap-[4px]">
                  <strong className="text-[40px] font-bold leading-[40px] text-[#10131A]">
                    {item.count}
                  </strong>

                  <span className="pb-[2px] text-[16px] font-semibold leading-[24px] text-[#555964]">
                    건
                  </span>
                </div>
              </div>

              {/* 위쪽 영역과 라벨 사이 16px */}
              <p className="mt-[16px] text-center text-[20px] font-semibold leading-[28px] text-[#10131A]">
                {item.label}
              </p>
            </article>
          ))}
        </div>

        {/* 온보딩 미완료일 때 카드 영역을 배경색으로 덮음 */}
        {!isOnboarded && (
          <>
            <div className="absolute inset-0 bg-[#F9FAFC]" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-[14px] font-semibold leading-[20px] text-[#10131A]">
                프로필을 업데이트하고
                <br />
                나에게 맞는 정보를 확인해 보세요.
              </p>

              <button
                type="button"
                onClick={onLockedClick}
                className="mt-[16px] h-[40px] rounded-[8px] bg-[#7962ED] px-[20px] text-[14px] font-semibold text-white"
              >
                프로필 업데이트하기
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
