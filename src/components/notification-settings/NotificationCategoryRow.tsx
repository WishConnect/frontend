import Toggle from '../common/Toggle';
import chevronRightIcon from '../../assets/notification/chevron-right.svg';

interface NotificationCategoryRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  isFirst?: boolean;
}

// 알림 설정 페이지의 서비스별 설정 행 — 아이콘은 실제 글리프 미지정이라 색상 원만 표시
export default function NotificationCategoryRow({
  title,
  description,
  checked,
  onChange,
  isFirst,
}: NotificationCategoryRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-6 py-6 ${
        isFirst ? '' : 'border-t border-[#E6E7EB]'
      }`}
    >
      <div className="flex items-center gap-6">
        <span className="size-20 rounded-full bg-[#F4F4FE] shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-[#0A0C11]">{title}</span>
            <img src={chevronRightIcon} alt="" className="size-6" />
          </div>
          <p className="text-base font-medium text-[#747883]">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} ariaLabel={`${title} 알림`} />
    </div>
  );
}
