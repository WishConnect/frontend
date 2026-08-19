import { useNavigate } from 'react-router-dom';
import Tag from '../Tag';
import ToggleIcon from '../ToggleIcon';
import ProgressRing from './ProgressRing';
import type { Scholarship } from '../../types/scholarship';
import ArchivePost from './ArchivePoster.svg';
import DdayStatus from '../DdayStatus';
interface ScholarshipCardProps {
  scholarship: Scholarship;
  onToggleScrap?: (scholarshipId: string, isScrapped: boolean) => void;
}

const STATUS_BUTTON_LABEL: Record<Scholarship['status'], string> = {
  before: '시작하기',
  'in-progress': '이어서 작성하기',
  done: '내용 보기',
};

// 아카이빙 카드: 장학금 썸네일 + 마감일 + 태그 + 자기소개서 진행률 + 액션 버튼
export default function ScholarshipCard({ scholarship, onToggleScrap }: ScholarshipCardProps) {
  const navigate = useNavigate();

  const {
    id,
    isScrapped = false,
    title,
    imageUrl,
    deadline,
    dDay,
    tags,
    status,
    questionLabel,
    progressPercent,
  } = scholarship;

  const handleGoToDetail = () => {
    const cleanId = String(id).replace('sch-', '');
    navigate(`/curation/${cleanId}`);
  };

  const handleToggleScrap = () => {
    onToggleScrap?.(String(id), isScrapped);
  };

  return (
    <div className="group relative w-full overflow-hidden rounded-2xl border border-[#E6E7EB] bg-white">
      <div className="h-[280px] w-full overflow-hidden rounded-t-2xl bg-[#F3F4F6]">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="block h-full w-full object-cover" />
        ) : (
          <img
            src={ArchivePost}
            alt=""
            className="block h-full w-full scale-[1.03] object-cover object-center"
          />
        )}
      </div>
      {/* 호버 시 이미지만 어둡게 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px] bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute right-4 top-4">
        <ToggleIcon type="bookmark" isActive={isScrapped} onClick={handleToggleScrap} />
      </div>

      <div className="relative -mt-6 flex flex-col rounded-2xl bg-white p-6 shadow-[0_-2px_10px_0_rgba(0,0,0,0.1)]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <DdayStatus days={dDay} />

              <span className="text-xs font-medium text-[#747883]">{deadline}</span>
            </div>

            <ProgressRing percent={progressPercent} />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="line-clamp-1 text-xl font-semibold leading-7 tracking-[-0.005em] text-[#0A0C11] group-hover:line-clamp-none">
              {title}
            </h3>

            <div className="flex items-center gap-1">
              {tags.map((tag) => (
                <Tag key={tag} variant="outline">
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        </div>

        {/* 기존 호버 애니메이션 유지 */}
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr]">
          <div className="flex flex-col gap-6 overflow-hidden">
            <div className="flex flex-col gap-1 pt-6">
              <div className="flex items-end justify-between gap-1">
                <span className="text-xs font-medium text-[#747883]">{questionLabel}</span>

                <span className="text-xl font-semibold leading-7 tracking-[-0.005em]">
                  <span className="text-[#7962ED]">{progressPercent}</span>
                  <span className="text-sm font-medium text-[#747883]">%</span>
                </span>
              </div>

              <div className="h-1 w-full rounded-full bg-[#E6E7EB]">
                <div
                  className="h-1 rounded-full bg-[#7962ED]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoToDetail}
              className={`flex h-9 items-center justify-center rounded-lg text-sm font-medium ${
                status === 'before'
                  ? 'border border-[#9DA1AC] bg-white text-[#555964]'
                  : 'bg-[#F3F4F6] text-[#0A0C11]'
              }`}
            >
              {STATUS_BUTTON_LABEL[status]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
