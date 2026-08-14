import { useNavigate } from 'react-router-dom';
import Tag from '../Tag';
import ToggleIcon from '../ToggleIcon';
import ProgressRing from './ProgressRing';
import type { Scholarship } from '../../types/scholarship';
import { useScrapStore } from '../../store/useScrapStore';

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

// D-Day 임박도에 따른 배지 색상: Figma 기준 D-20 이상 회색, D-10~19 노랑, D-9 이하 빨강
function getDDayColor(dDay: number) {
  if (dDay >= 20) return 'bg-[#D2D4DA]';
  if (dDay >= 10) return 'bg-[#FACC15]';
  return 'bg-[#FA5862]';
}

const STATUS_BUTTON_LABEL: Record<Scholarship['status'], string> = {
  before: '시작하기',
  'in-progress': '이어서 작성하기',
  done: '내용 보기',
};

// 아카이빙 카드: 장학금 썸네일 + 마감일 + 태그 + 자기소개서 진행률 + 액션 버튼
// scholarship 데이터는 지금은 mock, 나중에 백엔드 응답으로 그대로 교체 가능한 형태
// 스크랩 해제 시 목록에서 실제로 빠지도록 스크랩 상태는 전역 스토어로 관리 (로컬 state 아님)
export default function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const navigate = useNavigate();
  const isScrapped = useScrapStore((state) => state.isScrapped(scholarship.id));
  const toggleScrap = useScrapStore((state) => state.toggleScrap);
  const { id, title, imageUrl, deadline, dDay, tags, status, questionLabel, progressPercent } = scholarship;

  const handleGoToDetail = () => {
    const cleanId = String(id).replace("sch-", "");
    navigate(`/curation/${cleanId}`);
  };

  return (
    <div className="group relative w-full overflow-hidden rounded-2xl border border-[#E6E7EB] bg-white">
      <img src={imageUrl} alt={title} className="h-[280px] w-full rounded-t-2xl object-cover" />

      {/* 호버 시 이미지만 어둡게: Figma node 909:5393 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px] bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute right-4 top-4">
        <ToggleIcon type="bookmark" isActive={isScrapped} onClick={() => toggleScrap(id)} />
      </div>

      <div className="relative -mt-6 flex flex-col rounded-2xl bg-white p-6 shadow-[0_-2px_10px_0_rgba(0,0,0,0.1)]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-[55px] items-center justify-center rounded-lg text-sm font-bold text-white ${getDDayColor(dDay)}`}>
                D-{dDay}
              </span>
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

        {/* 진행률 + 버튼: 기본 상태에선 접혀서 숨겨져 있다가 호버 시 펼쳐짐 (Figma node 1393:6485 기본 / 909:5393 호버) */}
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
                <div className="h-1 rounded-full bg-[#7962ED]" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* 상태와 무관하게 자기소개서 작성 페이지(/write)로 이동. 작성 페이지는 아직 장학금별 id 파라미터가 없어 단일 라우트로 연결 (조회 전용 화면 생기면 done 분기 추가) */}
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
