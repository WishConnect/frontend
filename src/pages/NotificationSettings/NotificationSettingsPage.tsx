import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import NotificationCategoryRow from '../../components/notification-settings/NotificationCategoryRow';
import Toggle from '../../components/common/Toggle';
import bellIcon from '../../assets/notification/bell.svg';
import infoIcon from '../../assets/notification/info.svg';
import giftIcon from '../../assets/notification/gift.svg';
import chevronRightIcon from '../../assets/notification/chevron-right.svg';
import { useNotificationSettingsStore } from '../../store/useNotificationSettingsStore';

// 알림 설정 페이지: Figma node 1428:4581
export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const { showBadge, categories, toggleBadge, toggleCategory } = useNotificationSettingsStore();

  return (
    <div className="min-h-screen w-[1440px] bg-white">
      <Header isSearchMode onBack={() => navigate(-1)} />

      <div className="flex flex-col items-center gap-12 px-[109px] pt-8 pb-12">
        <div className="flex flex-col gap-12 w-full">
          <h1 className="text-[36px] leading-[48px] font-bold tracking-[-0.015em] text-[#181C25]">
            알림 설정
          </h1>

          <div className="flex flex-col gap-8 w-full">
            <div className="flex items-center justify-between gap-6 border border-[#D2D4DA] rounded-2xl p-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <img src={bellIcon} alt="" className="size-8" />
                  <h2 className="text-xl font-semibold text-[#0A0C11]">알림 표시</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium text-[#747883]">배지 아이콘 표시</span>
                  <img src={infoIcon} alt="" className="size-[18px]" />
                </div>
              </div>
              <Toggle checked={showBadge} onChange={toggleBadge} ariaLabel="배지 아이콘 표시" />
            </div>

            <div className="flex flex-col gap-6 border border-[#D2D4DA] rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={giftIcon} alt="" className="size-8" />
                  <h2 className="text-xl font-semibold text-[#0A0C11]">서비스별 설정</h2>
                </div>
                <button type="button" className="flex items-center gap-2 text-base font-medium text-[#555964]">
                  알림 받는 순
                  <img src={chevronRightIcon} alt="" className="size-[18px]" />
                </button>
              </div>

              <div className="flex flex-col">
                <NotificationCategoryRow
                  isFirst
                  title="맞춤 장학금"
                  description="조건에 맞는 신규 장학금, 모집 시작 알림"
                  checked={categories.scholarship}
                  onChange={() => toggleCategory('scholarship')}
                />
                <NotificationCategoryRow
                  title="일정"
                  description="마감 임박, 일정 변경 등의 알림"
                  checked={categories.schedule}
                  onChange={() => toggleCategory('schedule')}
                />
                <NotificationCategoryRow
                  title="작성"
                  description="지원서 작성 이어 쓰기, 임시 저장 알림"
                  checked={categories.writing}
                  onChange={() => toggleCategory('writing')}
                />
                <NotificationCategoryRow
                  title="기타"
                  description="공고 내용 변경, 합격 후기 등 기타 알림"
                  checked={categories.etc}
                  onChange={() => toggleCategory('etc')}
                />
              </div>
            </div>
          </div>
        </div>

        <p className="text-base font-medium text-[#747883] text-center">
          설정을 변경하면 즉시 적용됩니다.
        </p>
      </div>
    </div>
  );
}
