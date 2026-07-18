import { useMemo } from 'react';

import Header from '../../components/common/Header/Header';
import HomeGreeting from '../../components/Home/HomeGreeting';
import HomeBanner from '../../components/Home/HomeBanner';

import HomeSummaryCards from '../../components/Home/HomeSummary';
import WishConnectInfo from '../../components/Home/WishConnectInfo';
import MonthlySchedule, { type HomeSchedule } from '../../components/Home/MonthlySchedule';
import QuickMenuSection from '../../components/Home/QuickMenu';
import { useNavigate } from 'react-router-dom';
import { scholarships } from '../../mock/scholarships';

/**
 * "2026.05.01 - 2026.06.31" 같은 문자열에서
 * 날짜 부분만 찾아 "2026-05-01" 형식으로 바꾸는 함수
 */
function extractDates(text: string): string[] {
  const matchedDates = text.match(/\d{4}[.-]\d{2}[.-]\d{2}/g);

  return matchedDates?.map((date) => date.replaceAll('.', '-')) ?? [];
}

export default function HomePage() {
  const navigate = useNavigate();
  const isLoggedIn = true;
  const isOnboarded = false;

  const member = {
    name: '김위시',
  };

  const homeSchedules = useMemo<HomeSchedule[]>(() => {
    return scholarships.flatMap((scholarship) => {
      const convertedSchedules: HomeSchedule[] = [];

      const applicationPeriod = scholarship.summary.applicationPeriod ?? '';

      const periodDates = extractDates(applicationPeriod);
      const deadlineDates = extractDates(scholarship.deadline);

      const startDate = periodDates[0];

      const deadlineDate = deadlineDates[0] ?? periodDates[periodDates.length - 1];

      if (startDate) {
        convertedSchedules.push({
          id: `${scholarship.id}-start`,
          scholarshipId: scholarship.id,
          date: startDate,
          type: 'START',
          title: `${scholarship.title} 모집 시작`,
        });
      }

      if (deadlineDate) {
        convertedSchedules.push({
          id: `${scholarship.id}-deadline`,
          scholarshipId: scholarship.id,
          date: deadlineDate,
          type: 'DEADLINE',
          title: `${scholarship.title} 마감`,
        });
      }

      return convertedSchedules;
    });
  }, []);

  const handleBannerClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      console.log('로그인 페이지 이동');
      return;
    }

    if (!isOnboarded) {
      navigate('/onboarding');
      console.log('온보딩 페이지 이동');
      return;
    }

    navigate('/curation');
    console.log('큐레이팅 페이지 이동');
  };

  const handleLockedClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      console.log('로그인 페이지 이동');
      return;
    }

    navigate('/onboarding');
    console.log('온보딩 페이지 이동');
  };

  return (
    <div className="min-h-screen w-[1440px] bg-white font-['Pretendard']">
      <Header logoOnly />

      <main className="mx-auto flex w-[1222px] gap-[52px] flex-col pb-[64px] pt-[32px]">
        {/* 인사말 */}
        <HomeGreeting isLoggedIn={isLoggedIn} name={isLoggedIn ? member.name : undefined} />

        {/* 상태에 따라 문구와 버튼이 달라지는 배너 */}
        <div className="mt-[24px]">
          <HomeBanner
            isLoggedIn={isLoggedIn}
            isOnboarded={isOnboarded}
            onClick={handleBannerClick}
          />
        </div>

        {isLoggedIn && (
          <HomeSummaryCards isOnboarded={isOnboarded} onLockedClick={handleLockedClick} />
        )}

        {/* 위시커넥트 소개 + 이번 달 일정 */}
        <div className="mt-[32px] flex items-stretch gap-[32px]">
          <WishConnectInfo />

          <MonthlySchedule
            schedules={homeSchedules}
            isLocked={!isLoggedIn}
            onLockedClick={handleLockedClick}
          />
        </div>

        {/* 바로 가기 */}
        <QuickMenuSection />
      </main>
    </div>
  );
}
