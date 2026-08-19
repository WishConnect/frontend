import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/common/Header/Header';
import HomeGreeting from '../../components/Home/HomeGreeting';
import HomeBanner from '../../components/Home/HomeBanner';
import HomeSummaryCards from '../../components/Home/HomeSummary';
import WishConnectInfo from '../../components/Home/WishConnectInfo';
import MonthlySchedule, { type HomeSchedule } from '../../components/Home/MonthlySchedule';
import QuickMenuSection from '../../components/Home/QuickMenu';

import { fetchHomeSummary } from '../../api/Home/Summary';
import { fetchHomeCalendar } from '../../api/Home/Calendar';

import { useUserStore } from '../../store/user/user';

import type { HomeSummaryResponse } from '../../types/Home/Summary';

const INITIAL_HOME_SUMMARY: HomeSummaryResponse = {
  userName: '',
  newMatchedCount: 0,
  urgentDeadlineCount: 0,
  writingApplicationCount: 0,
  newInsightCount: 0,
  hasNewMatched: false,
};

export default function HomePage() {
  const navigate = useNavigate();

  const user = useUserStore((state) => state.user);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  const isOnboarded = Boolean(user?.onboardingCompleted);

  const [homeSummary, setHomeSummary] = useState<HomeSummaryResponse>(INITIAL_HOME_SUMMARY);
  const [homeSchedules, setHomeSchedules] = useState<HomeSchedule[]>([]);
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
  useEffect(() => {
    let isCancelled = false;

    const loadHomeCalendar = async () => {
      if (!isLoggedIn) {
        setHomeSchedules([]);
        return;
      }

      try {
        const data = await fetchHomeCalendar({
          scope: 'MATCHED',
        });

        if (isCancelled) {
          return;
        }

        const schedules: HomeSchedule[] = data.events.map((event, index) => ({
          id: `${event.scholarshipId}-${event.type}-${event.date}-${index}`,
          scholarshipId: event.scholarshipId,
          date: event.date,
          type: event.type,
          title: event.title,
        }));

        setHomeSchedules(schedules);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error('홈 장학금 일정 조회 실패:', error);
        setHomeSchedules([]);
      }
    };

    void loadHomeCalendar();

    return () => {
      isCancelled = true;
    };
  }, [isLoggedIn]);

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
              newMatchedCount={homeSummary.newMatchedCount}
              urgentDeadlineCount={homeSummary.urgentDeadlineCount}
              applicationCount={homeSummary.writingApplicationCount}
              newInsightCount={homeSummary.newInsightCount}
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
            onScheduleClick={(scholarshipId) => {
              navigate(`/curation/${scholarshipId}`);
            }}
          />
        </div>

        <QuickMenuSection isLoggedIn={isLoggedIn} />
      </main>
    </div>
  );
}
