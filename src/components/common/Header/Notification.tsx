import { useState } from 'react';
import bellDefault from '../../../assets/bell-default.svg';
import bellActive from '../../../assets/bell-active.svg';

interface NotificationProps {
  onClick?: () => void;
  className?: string;
}

// 알림 벨 버튼 — 클릭 시 기본/활성 아이콘 토글
export default function Notification({ onClick, className }: NotificationProps) {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive((prev) => !prev);
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-[32px] h-[32px] flex items-center justify-center ${className ?? ''}`}
      aria-label="알림"
    >
      <img src={isActive ? bellActive : bellDefault} alt="알림" width={32} height={32} />
    </button>
  );
}
