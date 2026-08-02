import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar';
import FilterTabs, { type ArchivingFilter } from '../../components/archiving/FilterTabs';
import ScholarshipCard from '../../components/archiving/ScholarshipCard';
import { mockScholarships } from '../../data/mockScholarships';
import { useScrapStore } from '../../store/useScrapStore';
import { useUserStore } from '../../store/user/user';

// 아카이빙 페이지: Figma node 1393:6451(전체)/6474(작성 전)/6657(진행 중)/6859(완료)
// scholarships는 지금 mock 배열, 백엔드 API 준비되면 이 부분만 fetch 결과로 교체하면 됨
export default function ArchivingPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ArchivingFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const scrappedIds = useScrapStore((state) => state.scrappedIds);
  // 아카이빙은 "내 스크랩" 개인 페이지라 비로그인 상태에선 목록 대신 로그인 유도만 보여줌
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

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

  const filteredScholarships = useMemo(() => {
    const byStatus =
      filter === 'all' ? scrappedScholarships : scrappedScholarships.filter((s) => s.status === filter);

    const trimmedQuery = searchQuery.trim();
    return trimmedQuery ? byStatus.filter((s) => s.title.includes(trimmedQuery)) : byStatus;
  }, [filter, scrappedScholarships, searchQuery]);

  return (
    <div className="h-[1024px] w-[1440px] bg-white">
      {/* isLoggedIn을 안 넘기면 Header가 유저 스토어를 따라 로그인/비로그인 상태를 알아서 표시함
          (비로그인: 검색바 + 로그인/회원가입 버튼 / 로그인: 검색바 + 알림 벨) */}
      <Header
        searchPlaceholder="내가 스크랩한 장학금 찾아보기"
        onSearch={isLoggedIn ? setSearchQuery : undefined}
        onQueryChange={isLoggedIn ? setSearchQuery : undefined}
      />

      {/* 사이드바 + 본문. 폭 합계를 페이지 폭(1440px)에 정확히 맞춘다: 64 + 237 + 32 + 1043 + 64.
          합계가 넘치면 flex가 사이드바까지 같이 줄여서 큐레이팅/인사이트와 폭이 어긋나므로,
          shrink-0으로 사이드바 폭을 고정하고 본문 폭을 남는 값(1043px)으로 명시한다.
          상단 패딩은 두지 않는다(헤더 80px 바로 아래 시작 = 다른 페이지와 동일 기준선). */}
      <div className="flex gap-8 px-16 pb-6">
        <div className="h-[896px] w-[237px] shrink-0 self-start">
          <LeftSidebar activeId="archiving" />
        </div>

        <main className="flex w-[1043px] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-[40px] font-bold leading-[52px] tracking-[-0.02em] text-[#10131A]">아카이빙</h1>
            <p className="text-base font-medium text-[#555964]">
              스크랩한 장학금과 자기소개서 진행 현황을 한 눈에 관리해보세요.
            </p>
          </div>

          {!isLoggedIn ? (
            // 비로그인: 필터탭/카드 그리드 대신 로그인 유도 영역 (페이지 자체는 그대로 보여줌)
            <div className="flex flex-col items-center gap-6 py-32">
              <div className="flex flex-col items-center gap-2">
                <p className="text-2xl font-bold leading-8 text-[#10131A]">
                  로그인하면 스크랩한 장학금을 한 곳에서 관리할 수 있어요
                </p>
                <p className="text-base font-medium text-[#747883]">
                  관심 있는 장학금을 저장하고 자기소개서 진행 현황까지 확인해보세요.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex h-12 items-center justify-center rounded-lg bg-[linear-gradient(109.4deg,#7962ED_30.662%,#BDB9F9_105.21%)] px-8"
              >
                <span className="text-base font-semibold leading-6 text-white">로그인하러 가기</span>
              </button>
            </div>
          ) : (
            // 로그인: 기존대로 필터탭 + 카드 그리드 (fragment라 main의 flex gap 간격은 그대로 유지됨)
            <>
              <FilterTabs active={filter} onChange={setFilter} counts={counts} />

              {filteredScholarships.length === 0 ? (
                // 검색/필터 결과가 0건일 때 빈 그리드만 남는 것 방지. 검색어가 있으면 검색 문구, 없으면 일반 빈 상태 문구
                <p className="py-16 text-center text-base font-medium text-[#747883]">
                  {searchQuery.trim()
                    ? `'${searchQuery.trim()}' 검색 결과가 없어요.`
                    : '스크랩한 장학금이 없어요.'}
                </p>
              ) : (
                <div className="grid grid-cols-3 items-start gap-8">
                  {filteredScholarships.map((scholarship) => (
                    <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
