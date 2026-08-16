import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import NotificationCategoryRow from '../../components/notification-settings/NotificationCategoryRow';
import Toggle from '../../components/common/Toggle';
import bellIcon from '../../assets/notification/bell.svg';
import infoIcon from '../../assets/notification/info.svg';
import giftIcon from '../../assets/notification/gift.svg';
// 서비스별 설정 행 아이콘. 시안이 lucide/graduation-cap·clock·pencil·file-text를 쓰므로
// 같은 세트인 react-icons/lu에서 가져온다 (별도 svg 파일을 두지 않아도 글리프가 동일).
import { LuGraduationCap, LuClock, LuPencil, LuFileText } from 'react-icons/lu';
import { useNotificationSettingsStore } from '../../store/useNotificationSettingsStore';
import { getNotificationSettings, putNotificationSettings, type NotificationSettings } from '../../api/notification/settings';

// 알림 설정 페이지: Figma node 1428:4581
export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const { showBadge, categories, toggleBadge, toggleCategory, initSettings } = useNotificationSettingsStore();
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getNotificationSettings();
        if (data && initSettings) {
          initSettings(data);
        }
      } catch (error) {
        console.error("알림 설정 조회 실패:", error);
      }
    };
    fetchSettings();
  }, [initSettings]);

  // 저장 성공 여부를 반환한다. 실패하면 호출부에서 토글을 되돌린다.
  const syncSettingsWithBackend = async (
    updatedFields: Partial<NotificationSettings>,
  ): Promise<boolean> => {
    const currentSettings: NotificationSettings = {
      notificationEnabled: showBadge,
      matchingEnabled: categories.scholarship,
      scheduleEnabled: categories.schedule,
      essayEnabled: categories.writing,
      etcEnabled: categories.etc,
    };

    const payload = { ...currentSettings, ...updatedFields };

    try {
      await putNotificationSettings(payload);
      return true;
    } catch (error) {
      console.error('알림 설정 변경 저장 실패:', error);
      return false;
    }
  };

  // 토글은 먼저 켜고(낙관적 업데이트) 저장이 실패하면 되돌린다.
  // 안 되돌리면 저장된 줄 알았다가 새로고침 시 원래대로 돌아가 버린다.
  const handleToggleBadge = async () => {
    setSaveError(null);
    toggleBadge();

    const saved = await syncSettingsWithBackend({ notificationEnabled: !showBadge });
    if (!saved) {
      toggleBadge();
      setSaveError('알림 설정을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleToggleCategory = async (key: 'scholarship' | 'schedule' | 'writing' | 'etc', backendKey: keyof NotificationSettings) => {
    setSaveError(null);
    toggleCategory(key);

    const saved = await syncSettingsWithBackend({ [backendKey]: !categories[key] });
    if (!saved) {
      toggleCategory(key);
      setSaveError('알림 설정을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <div className="min-h-screen w-[1440px] bg-white">
      <Header isSearchMode onBack={() => navigate(-1)} />

      <div className="flex flex-col items-center gap-12 px-[109px] pt-8 pb-12">
        <div className="flex flex-col gap-12 w-full">
          <h1 className="text-[36px] leading-[48px] font-bold tracking-[-0.015em] text-[#181C25]">
            알림 설정
          </h1>

          {/* 저장 실패 안내: 토글이 원래 상태로 되돌아갔음을 알려준다 */}
          {saveError && (
            <p className="rounded-lg bg-[#FEF2F2] px-6 py-3 text-sm font-medium text-[#FA5862]">
              {saveError}
            </p>
          )}

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
              <Toggle checked={showBadge} onChange={handleToggleBadge} ariaLabel="배지 아이콘 표시" />
            </div>

            <div className="flex flex-col gap-6 border border-[#D2D4DA] rounded-2xl p-6">
              {/* 시안(1428:4599)에는 오른쪽에 "알림 받는 순" 정렬 버튼 레이어가 있지만
                  visible=false로 숨겨져 있어 넣지 않는다. 코드에 남아 있던 것도 onClick이 없어
                  눌러도 아무 동작을 하지 않던 버튼이라 같이 제거했다. */}
              <div className="flex items-center gap-3">
                <img src={giftIcon} alt="" className="size-8" />
                <h2 className="text-xl font-semibold text-[#0A0C11]">서비스별 설정</h2>
              </div>

              <div className="flex flex-col">
                <NotificationCategoryRow
                  isFirst
                  icon={LuGraduationCap}
                  title="맞춤 장학금"
                  description="조건에 맞는 신규 장학금, 모집 시작 알림"
                  checked={categories.scholarship}
                  onChange={() => handleToggleCategory('scholarship', 'matchingEnabled')}
                />
                <NotificationCategoryRow
                  icon={LuClock}
                  title="일정"
                  description="마감 임박, 일정 변경 등의 알림"
                  checked={categories.schedule}
                  onChange={() => handleToggleCategory('schedule', 'scheduleEnabled')}
                />
                <NotificationCategoryRow
                  icon={LuPencil}
                  title="작성"
                  description="지원서 작성 이어 쓰기, 임시 저장 알림"
                  checked={categories.writing}
                  onChange={() => handleToggleCategory('writing', 'essayEnabled')}
                />
                <NotificationCategoryRow
                  icon={LuFileText}
                  title="기타"
                  description="공고 내용 변경, 합격 후기 등 기타 알림"
                  checked={categories.etc}
                  onChange={() => handleToggleCategory('etc', 'etcEnabled')}
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
