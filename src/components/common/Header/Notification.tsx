import bellDefault from '../../../assets/bell-default.svg';
import bellActive from '../../../assets/bell-active.svg';

interface NotificationProps {
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

// 알림 벨 버튼 — 안 읽은 알림이 있으면 active(bell-active), 없으면 default 아이콘
export default function Notification({ onClick, isActive = false, className }: NotificationProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-[32px] h-[32px] flex items-center justify-center ${className ?? ''}`}
      aria-label="알림"
    >
      <img src={isActive ? bellActive : bellDefault} alt="알림" width={32} height={32} />
    </button>
  );
}
