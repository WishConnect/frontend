import Button from '../../Button/Button';
import closeIcon from '../../../assets/notification/close.svg';
import type { NotificationCategory } from '../../../store/useNotificationStore';

interface NotificationItemCardProps {
  category: NotificationCategory;
  timeAgo: string;
  title: string;
  description: string;
  ctaLabel: string;
  onDismiss: () => void;
  onCtaClick: () => void;
}

// 알림센터 패널의 개별 알림 카드 — 카테고리 아이콘은 실제 글리프 미지정이라 색상 원만 표시
export default function NotificationItemCard({
  category,
  timeAgo,
  title,
  description,
  ctaLabel,
  onDismiss,
  onCtaClick,
}: NotificationItemCardProps) {
  return (
    <div className="flex flex-col items-end gap-3 p-4 self-stretch bg-white border border-[#E6E7EB] rounded-2xl">
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="size-10 rounded-full bg-[#F4F4FE] shrink-0" />
              <span className="text-base font-semibold text-[#0A0C11]">{category}</span>
            </div>
            <span className="size-1 rounded-full bg-[#D2D4DA]" />
            <span className="text-base font-medium text-[#555964]">{timeAgo}</span>
          </div>
          <button type="button" onClick={onDismiss} aria-label="알림 닫기">
            <img src={closeIcon} alt="" className="size-6" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-base font-medium text-[#0A0C11]">{title}</p>
          <p className="text-sm font-medium text-[#555964]">{description}</p>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onCtaClick}>
        {ctaLabel}
      </Button>
    </div>
  );
}
