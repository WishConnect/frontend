import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar';
import FilterTabs, { type ArchivingFilter } from '../../components/archiving/FilterTabs';
import ScholarshipCard from '../../components/archiving/ScholarshipCard';
import { mockScholarships } from '../../data/mockScholarships';
import { useScrapStore } from '../../store/useScrapStore';

// 아카이빙 페이지 — Figma node 1393:6451(전체)/6474(작성 전)/6657(진행 중)/6859(완료)
// scholarships는 지금 mock 배열, 백엔드 API 준비되면 이 부분만 fetch 결과로 교체하면 됨
export default function ArchivingPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ArchivingFilter>('all');
  const scrappedIds = useScrapStore((state) => state.scrappedIds);

  // 아카이빙 = "내가 스크랩한 장학금" 목록이므로 스크랩 해제된 항목은 여기서 제외
  const scrappedScholarships = useMemo(
    () => mockScholarships.filter((s) => scrappedIds.has(s.id)),
    [scrappedIds],
  );

  const counts = useMemo(
    () => ({
      all: scrappedScholarships.length,
      before: scrappedScholarships.filter((s) => s.status === 'before').length,
      'in-progress': scrappedScholarships.filter((s) => s.status === 'in-progress').length,
      done: scrappedScholarships.filter((s) => s.status === 'done').length,
    }),
    [scrappedScholarships],
  );

  const filteredScholarships = useMemo(
    () => (filter === 'all' ? scrappedScholarships : scrappedScholarships.filter((s) => s.status === filter)),
    [filter, scrappedScholarships],
  );

  return (
    <div className="min-h-screen bg-white">
      <Header
        searchPlaceholder="내가 스크랩한 장학금 찾아보기"
        onSearch={(query) => navigate(`/archiving/search?q=${encodeURIComponent(query)}`)}
      />

      <div className="flex gap-8 px-16 py-6">
        <LeftSidebar activeId="archiving" />

        <main className="flex w-full min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-[40px] font-bold leading-[52px] tracking-[-0.02em] text-[#10131A]">아카이빙</h1>
            <p className="text-base font-medium text-[#555964]">
              스크랩한 장학금과 자기소개서 진행 현황을 한 눈에 관리해보세요.
            </p>
          </div>

          <FilterTabs active={filter} onChange={setFilter} counts={counts} />

          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
            {filteredScholarships.map((scholarship) => (
              <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
