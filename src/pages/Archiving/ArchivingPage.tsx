import { useEffect, useState } from 'react';
import { unscrapScholarship } from '../../api/Curation/Scrap';
import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar';
import FilterTabs, { type ArchivingFilter } from '../../components/archiving/FilterTabs';
import ScholarshipCard from '../../components/archiving/ScholarshipCard';

import { getArchive } from '../../api/archiving/archive';

import type { ArchiveItem, ArchiveStatus } from '../../types/Archiving/archive';

// 아카이빙 페이지: Figma node 1393:6451(전체)/6474(작성 전)/6657(진행 중)/6859(완료)
export default function ArchivingPage() {
  const [filter, setFilter] = useState<ArchivingFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([]);

  const [counts, setCounts] = useState({
    all: 0,
    before: 0,
    'in-progress': 0,
    done: 0,
  });

  const getBackendStatus = (selectedFilter: ArchivingFilter): ArchiveStatus | undefined => {
    switch (selectedFilter) {
      case 'before':
        return 'NOT_STARTED';

      case 'in-progress':
        return 'IN_PROGRESS';

      case 'done':
        return 'COMPLETED';

      default:
        return undefined;
    }
  };

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        const targetStatus = getBackendStatus(filter);

        const data = await getArchive({
          status: targetStatus,
          keyword: searchQuery.trim() || undefined,
          page: 1,
          size: 100,
        });

        setArchiveItems(data.items);

        setCounts({
          all: data.counts.all,
          before: data.counts.notStarted,
          'in-progress': data.counts.inProgress,
          done: data.counts.completed,
        });
      } catch (error) {
        console.error('아카이빙 목록 조회 실패:', error);

        setArchiveItems([]);
      }
    };

    fetchArchive();
  }, [filter, searchQuery]);

  const transformToScholarship = (item: ArchiveItem) => {
    let status: 'before' | 'in-progress' | 'done' = 'before';

    if (item.applicationStatus === 'IN_PROGRESS') {
      status = 'in-progress';
    }

    if (item.applicationStatus === 'COMPLETED') {
      status = 'done';
    }

    const formattedDeadline = item.deadline ? item.deadline.slice(0, 10).replaceAll('-', '.') : '';

    return {
      id: String(item.scholarshipId),
      applicationId: item.applicationId,
      title: item.title,
      imageUrl: item.posterUrl,
      deadline: formattedDeadline,
      dDay: item.dDay,
      tags: item.tags,
      status,
      progressPercent: item.progress.percentage,
      questionLabel: `${item.progress.totalQuestions}문항 중 ${item.progress.completedQuestions}문항 작성`,
    };
  };

  const displayScholarships = archiveItems.map(transformToScholarship);
  const handleUnscrap = async (scholarshipId: number | string) => {
    try {
      await unscrapScholarship(scholarshipId);

      setArchiveItems((prev) =>
        prev.filter((item) => String(item.scholarshipId) !== String(scholarshipId)),
      );

      setCounts((prev) => {
        const next = {
          ...prev,
          all: Math.max(0, prev.all - 1),
        };

        if (filter === 'before') {
          next.before = Math.max(0, prev.before - 1);
        }

        if (filter === 'in-progress') {
          next['in-progress'] = Math.max(0, prev['in-progress'] - 1);
        }

        if (filter === 'done') {
          next.done = Math.max(0, prev.done - 1);
        }

        return next;
      });
    } catch (error) {
      console.error('스크랩 해제 실패:', error);
    }
  };
  return (
    <div className="h-[1024px] w-[1440px] bg-white">
      <Header
        searchPlaceholder="내가 스크랩한 장학금 찾아보기"
        onSearch={setSearchQuery}
        onQueryChange={setSearchQuery}
      />

      <div className="min-h-screen flex ml-[64px] mr-[32px]">
        <LeftSidebar activeId="archiving" />

        <main className="flex w-[1139px] flex-col gap-8 pt-[16px] pl-[32px]">
          <div className="flex flex-col gap-2">
            <h1 className="text-[40px] font-bold leading-[52px] tracking-[-0.02em] text-[#10131A]">
              보관함
            </h1>

            <p className="text-base font-medium text-[#555964]">
              스크랩한 장학금과 자기소개서 진행 현황을 한 눈에 관리해보세요.
            </p>
          </div>

          <FilterTabs active={filter} onChange={setFilter} counts={counts} />

          {displayScholarships.length === 0 ? (
            <p className="py-16 text-center text-base font-medium text-[#747883]">
              {searchQuery.trim()
                ? `'${searchQuery.trim()}' 검색 결과가 없어요.`
                : '스크랩한 장학금이 없어요.'}
            </p>
          ) : (
            <div className="grid grid-cols-3 items-start gap-8">
              {displayScholarships.map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                  onUnscrap={() => handleUnscrap(scholarship.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
