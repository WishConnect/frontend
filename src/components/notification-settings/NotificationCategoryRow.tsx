import type { IconType } from 'react-icons';
import Toggle from '../common/Toggle';

interface NotificationCategoryRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  // 왼쪽 원형 배지 안에 들어갈 아이콘. 시안이 lucide 세트를 쓰므로 react-icons/lu에서 같은 글리프를 넘긴다.
  icon: IconType;
  isFirst?: boolean;
}

// 알림 설정 페이지의 서비스별 설정 행 (Figma 1428:4599)
// 시안 수치: 원 80x80 / 배경 #F4F4FE / 아이콘 48x48 / 색 #7962ED / 선 굵기 3px
export default function NotificationCategoryRow({
  title,
  description,
  checked,
  onChange,
  icon: Icon,
  isFirst,
}: NotificationCategoryRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-6 py-6 ${
        isFirst ? '' : 'border-t border-[#E6E7EB]'
      }`}
    >
      <div className="flex items-center gap-6">
        {/* 원형 배지: 아이콘을 가운데 두려고 flex로 감싼다. shrink-0이 없으면 제목이 길 때 원이 찌그러진다 */}
        <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#F4F4FE]">
          {/* strokeWidth는 화면 px이 아니라 viewBox 단위다. lucide는 viewBox가 0 0 24 24인데
              48px(size-12)로 그리므로 2배 확대된다. 시안의 3px에 맞추려면 3이 아니라 1.5를 줘야 한다. */}
          <Icon className="size-12 text-[#7962ED]" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-2">
          {/* 시안에는 제목 옆 chevron 레이어가 있지만 visible=false로 숨겨져 있어 넣지 않는다 */}
          <span className="text-xl font-semibold text-[#0A0C11]">{title}</span>
          <p className="text-base font-medium text-[#747883]">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} ariaLabel={`${title} 알림`} />
    </div>
  );
}
