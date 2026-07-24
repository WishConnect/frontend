import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/common/Header/Header';
import HomeGreeting from '../../components/Home/HomeGreeting';
import HomeBanner from '../../components/Home/HomeBanner';
import HomeSummaryCards from '../../components/Home/HomeSummary';
import WishConnectInfo from '../../components/Home/WishConnectInfo';
import MonthlySchedule, { type HomeSchedule } from '../../components/Home/MonthlySchedule';
import QuickMenuSection from '../../components/Home/QuickMenu';

import { scholarships } from '../../mock/scholarships';
import { useUserStore } from '../../store/user/user';

function extractDates(text: string): string[] {
  const matchedDates = text.match(/\d{4}[.-]\d{2}[.-]\d{2}/g);

  return matchedDates?.map((date) => date.replaceAll('.', '-')) ?? [];
}

export default function HomePage() {
  const navigate = useNavigate();

  const user = useUserStore((state) => state.user);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  const isOnboarded = Boolean(user?.onboardingCompleted);

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
      return;
    }

    if (!isOnboarded) {
      navigate('/onboarding');
      return;
    }

    navigate('/curation');
  };

  const handleLockedClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen w-[1440px] bg-white font-['Pretendard']">
      <Header logoOnly />

      <main className="mx-auto flex w-[1222px] flex-col gap-[52px] pt-[32px] pb-[64px]">
        <HomeGreeting
          isLoggedIn={isLoggedIn}
          name={isLoggedIn ? (user?.name ?? '회원') : undefined}
        />

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

        <div className="mt-[32px] flex items-stretch gap-[32px]">
          <WishConnectInfo />

          <MonthlySchedule
            schedules={homeSchedules}
            isLocked={!isLoggedIn}
            onLockedClick={handleLockedClick}
          />
        </div>

        <QuickMenuSection />
      </main>
    </div>
  );
}
