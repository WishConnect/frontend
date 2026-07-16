import type { Scholarship } from '../../types/scholarship';

export type ArchivingFilter = 'all' | Scholarship['status'];

interface FilterTabsProps {
  active: ArchivingFilter;
  onChange: (filter: ArchivingFilter) => void;
  counts: Record<ArchivingFilter, number>;
}

const FILTERS: { key: ArchivingFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'before', label: '작성 전' },
  { key: 'in-progress', label: '진행 중' },
  { key: 'done', label: '완료' },
];

// 아카이빙 상태 필터 탭: 클릭 시 로컬에서 목록만 필터링 (서버 요청 없음)
export default function FilterTabs({ active, onChange, counts }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-2">
      {FILTERS.map(({ key, label }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold ${
              isActive
                ? 'bg-[linear-gradient(139deg,#7962ED_30%,#BDB9F9_100%)] text-white'
                : 'border border-[#9DA1AC] bg-white text-[#555964]'
            }`}
          >
            {label} ({counts[key]})
          </button>
        );
      })}
    </div>
  );
}
