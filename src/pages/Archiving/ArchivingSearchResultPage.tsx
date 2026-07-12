import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar';
import ScholarshipCard from '../../components/archiving/ScholarshipCard';
import { mockScholarships } from '../../data/mockScholarships';
import { useScrapStore } from '../../store/useScrapStore';

// 아카이빙 검색 결과 페이지 — Figma node 1260:2215
export default function ArchivingSearchResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const scrappedIds = useScrapStore((state) => state.scrappedIds);

  // 아카이빙 = "내가 스크랩한 장학금" 목록이므로 스크랩 해제된 항목은 검색 결과에서도 제외
  const results = mockScholarships.filter(
    (scholarship) => scrappedIds.has(scholarship.id) && scholarship.title.includes(query),
  );

  const handleSearch = (term: string) => {
    navigate(`/archiving/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        searchPlaceholder="내가 스크랩한 장학금 찾아보기"
        searchInitialValue={query}
        onSearch={handleSearch}
      />

      <div className="flex gap-8 px-16 py-6">
        <LeftSidebar activeId="archiving" />

        <main className="flex w-full min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-[40px] font-bold leading-[52px] tracking-[-0.02em] text-[#10131A]">
              &lsquo;{query}&rsquo; 검색 결과
            </h1>
            <p className="text-base font-medium text-[#555964]">
              총 <span className="font-bold text-[#7962ED]">{results.length}개</span>의 결과를 찾았어요.
            </p>
          </div>

          {/* 정렬 드롭다운 — Figma에 옵션 목록이 없어 표시만, 실제 정렬 기능은 추후 */}
          <div className="flex justify-end">
            <div className="flex items-center gap-6 rounded-[8px] bg-[#F9FAFC] px-4 py-3">
              <span className="text-base font-medium text-[#555964]">마감 임박순</span>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
            {results.map((scholarship) => (
              <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
