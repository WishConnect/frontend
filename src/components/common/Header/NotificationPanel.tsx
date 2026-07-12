import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../Button/Button';
import NotificationItemCard from './NotificationItemCard';
import settingsIcon from '../../../assets/notification/settings.svg';
import chevronRightIcon from '../../../assets/notification/chevron-right.svg';
import { useNotificationStore, type NotificationCategory } from '../../../store/useNotificationStore';

const FILTERS: ('전체' | NotificationCategory)[] = ['전체', '맞춤 장학금', '일정', '작성', '기타'];

// 헤더 벨 클릭 시 뜨는 알림센터 패널 — Figma node 1122:2842
export default function NotificationPanel() {
  const navigate = useNavigate();
  const { items, isPanelOpen, togglePanel, markAsRead, removeItem, clearAll } = useNotificationStore();
  const [activeFilter, setActiveFilter] = useState<'전체' | NotificationCategory>('전체');

  if (!isPanelOpen) return null;

  const filteredItems = activeFilter === '전체' ? items : items.filter((item) => item.category === activeFilter);

  const handleSettingsClick = () => {
    togglePanel();
    navigate('/notifications/settings');
  };

  return (
    <div className="absolute right-[64px] top-[64px] w-[448px] bg-[#F9FAFC] border border-[#E6E7EB] rounded-2xl shadow-lg p-6 flex flex-col gap-4 z-50">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#181C25]">알림센터</h2>
        <button type="button" onClick={handleSettingsClick} aria-label="알림 설정">
          <img src={settingsIcon} alt="" className="size-8" />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'gradient' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </Button>
        ))}
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={clearAll} className="text-sm font-medium text-[#747883] underline">
          전체 삭제
        </button>
      </div>

      <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto">
        {filteredItems.length === 0 && (
          <p className="text-center text-sm text-[#9DA1AC] py-8">알림이 없어요.</p>
        )}
        {filteredItems.map((item) => (
          <NotificationItemCard
            key={item.id}
            category={item.category}
            timeAgo={item.timeAgo}
            title={item.title}
            description={item.description}
            ctaLabel={item.ctaLabel}
            onDismiss={() => removeItem(item.id)}
            onCtaClick={() => markAsRead(item.id)}
          />
        ))}
      </div>

      <button type="button" disabled className="flex items-center justify-center gap-1 text-sm font-medium text-[#9DA1AC]">
        더 많은 알림 보기
        <img src={chevronRightIcon} alt="" className="size-[18px]" />
      </button>
    </div>
  );
}
