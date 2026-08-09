import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useUserStore } from '../../store/user/user';
// import { useScrapStore } from '../../store/useScrapStore';
import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar';
import FilterTabs, { type ArchivingFilter } from '../../components/archiving/FilterTabs';
import ScholarshipCard from '../../components/archiving/ScholarshipCard';
import { getApplications, type ApplicationItem, type ApplicationStatus } from '../../api/archiving/list';

// 아카이빙 페이지: Figma node 1393:6451(전체)/6474(작성 전)/6657(진행 중)/6859(완료)
// scholarships는 지금 mock 배열, 백엔드 API 준비되면 이 부분만 fetch 결과로 교체하면 됨
export default function ArchivingPage() {
  // const navigate = useNavigate();
  const [filter, setFilter] = useState<ArchivingFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  // const scrappedIds = useScrapStore((state) => state.scrappedIds);
  // // 아카이빙은 "내 스크랩" 개인 페이지라 비로그인 상태에선 목록 대신 로그인 유도만 보여줌
  // const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  // const scrappedIds = useScrapStore((state) => state.scrappedIds);

  // // 아카이빙 = "내가 스크랩한 장학금" 목록이므로 스크랩 해제된 항목은 여기서 제외
  // const scrappedScholarships = useMemo(
  //   () => mockScholarships.filter((s) => scrappedIds.has(s.id)),
  //   [scrappedIds],
  // );

  // const counts = useMemo(
  //   () => ({
  //     all: scrappedScholarships.length,
  //     before: scrappedScholarships.filter((s) => s.status === 'before').length,
  //     'in-progress': scrappedScholarships.filter((s) => s.status === 'in-progress').length,
  //     done: scrappedScholarships.filter((s) => s.status === 'done').length,
  //   }),
  //   [scrappedScholarships],
  // );

  // const filteredScholarships = useMemo(() => {
  //   const byStatus =
  //     filter === 'all' ? scrappedScholarships : scrappedScholarships.filter((s) => s.status === filter);

  //   const trimmedQuery = searchQuery.trim();
  //   return trimmedQuery ? byStatus.filter((s) => s.title.includes(trimmedQuery)) : byStatus;
  // }, [filter, scrappedScholarships, searchQuery]);


  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  const getBackendStatus = (f: ArchivingFilter): ApplicationStatus => {
    switch (f) {
      case 'before': return 'NOT_STARTED';
      case 'in-progress': return 'IN_PROGRESS';
      case 'done': return 'COMPLETED';
      default: return undefined;
    }
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const targetStatus = getBackendStatus(filter);
        const res = await getApplications(targetStatus, 0, 100);
        
        if (res.success && res.data) {
          setApplications(res.data.content);
        }
      } catch (error) {
        console.error("지원서 목록 조회 실패", error);
      }
    };

    fetchApplications();
  }, [filter]);

const transformToScholarship = (app: ApplicationItem): any => {
    let status = 'in-progress';
    if (app.status === 'IN_PROGRESS') status = 'in-progress';
    if (app.status === 'COMPLETED') status = 'done';

    const progressPercent = app.progress.total === 0 
      ? 0 
      : Math.round((app.progress.completed / app.progress.total) * 100);

    return {
      id: app.scholarshipId,
      applicationId: app.applicationId,
      title: app.scholarshipTitle,
      status: status,
      progressPercent: progressPercent,
      questionLabel: `${app.progress.total}문항 중 ${app.progress.completed}문항 작성`,
      
      imageUrl: 'https://via.placeholder.com/300x200?text=No+Image', 
      deadline: '임시데이터',
      dDay: 3,
      tags: ['test', 'test'],
    };
  };

  const displayScholarships = applications
    .filter((app) => 
      searchQuery.trim() === '' ? true : app.scholarshipTitle.includes(searchQuery.trim())
    )
    .map(transformToScholarship); 

  const counts = { all: 0, before: 0, 'in-progress': 0, done: 0 };

  return (
    <div className="h-[1024px] w-[1440px] bg-white">
      {/* isLoggedIn을 안 넘기면 Header가 유저 스토어를 따라 로그인/비로그인 상태를 알아서 표시함
          (비로그인: 검색바 + 로그인/회원가입 버튼 / 로그인: 검색바 + 알림 벨) */}
      <Header
        searchPlaceholder="내가 스크랩한 장학금 찾아보기"
        onSearch={setSearchQuery}
        onQueryChange={setSearchQuery}
      />

      <div className="flex gap-8 px-16 py-6">
        <LeftSidebar activeId="archiving" />

        <main className="flex w-[1139px] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-[40px] font-bold leading-[52px] tracking-[-0.02em] text-[#10131A]">아카이빙</h1>
            <p className="text-base font-medium text-[#555964]">
              스크랩한 장학금과 자기소개서 진행 현황을 한 눈에 관리해보세요.
            </p>
          </div>

          <FilterTabs active={filter} onChange={setFilter} counts={counts} />

          {applications.length === 0 ? (
            // 검색/필터 결과가 0건일 때 빈 그리드만 남는 것 방지. 검색어가 있으면 검색 문구, 없으면 일반 빈 상태 문구
            <p className="py-16 text-center text-base font-medium text-[#747883]">
              {searchQuery.trim()
                ? `'${searchQuery.trim()}' 검색 결과가 없어요.`
                : '스크랩한 장학금이 없어요.'}
            </p>
          ) : (
            <div className="grid grid-cols-3 items-start gap-8">
              {displayScholarships.map((scholarship) => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}