import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/common/Header/Header';
import HomeGreeting from '../../components/Home/HomeGreeting';
import HomeBanner from '../../components/Home/HomeBanner';
import HomeSummaryCards from '../../components/Home/HomeSummary';
import WishConnectInfo from '../../components/Home/WishConnectInfo';
import MonthlySchedule, { type HomeSchedule } from '../../components/Home/MonthlySchedule';
import QuickMenuSection from '../../components/Home/QuickMenu';

import { fetchHomeSummary } from '../../api/Home/Summary';
import { scholarships } from '../../mock/scholarships';
import { useUserStore } from '../../store/user/user';

import type { HomeSummaryResponse } from '../../types/Home/Summary';

function extractDates(text: string): string[] {
  const matchedDates = text.match(/\d{4}[.-]\d{2}[.-]\d{2}/g);

  return matchedDates?.map((date) => date.replaceAll('.', '-')) ?? [];
}

const INITIAL_HOME_SUMMARY: HomeSummaryResponse = {
  newMatchedCount: 0,
  urgentDeadlineCount: 0,
  hasNewMatched: false,
};

export default function HomePage() {
  const navigate = useNavigate();

  const user = useUserStore((state) => state.user);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  const isOnboarded = Boolean(user?.onboardingCompleted);

  const [homeSummary, setHomeSummary] = useState<HomeSummaryResponse>(INITIAL_HOME_SUMMARY);

  //const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryErrorMessage, setSummaryErrorMessage] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadHomeSummary = async () => {
      if (!isLoggedIn) {
        setHomeSummary(INITIAL_HOME_SUMMARY);
        setSummaryErrorMessage('');
        //setIsSummaryLoading(false);
        return;
      }

      try {
        //setIsSummaryLoading(true);
        setSummaryErrorMessage('');

        const data = await fetchHomeSummary();

        if (isCancelled) {
          return;
        }

        setHomeSummary(data);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error('홈 장학금 소식 조회 실패:', error);

        setHomeSummary(INITIAL_HOME_SUMMARY);

        setSummaryErrorMessage(
          error instanceof Error ? error.message : '오늘의 장학금 소식을 불러오지 못했습니다.',
        );
      }
    };

    void loadHomeSummary();

    return () => {
      isCancelled = true;
    };
  }, [isLoggedIn]);

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
          <>
            {summaryErrorMessage && (
              <p className="text-[14px] font-medium text-[#747883]">{summaryErrorMessage}</p>
            )}

            <HomeSummaryCards
              isOnboarded={isOnboarded}
              //isLoading={isSummaryLoading}
              newMatchedCount={homeSummary.newMatchedCount}
              urgentDeadlineCount={homeSummary.urgentDeadlineCount}
              applicationCount={1}
              newInsightCount={3}
              onLockedClick={handleLockedClick}
            />
          </>
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
