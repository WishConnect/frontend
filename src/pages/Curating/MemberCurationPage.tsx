import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import RecommendCard from '../../components/Curation/RecommendCard';
import SchoolSection from '../../components/Curation/SchoolSection';
import RecruitingSection from '../../components/Curation/RecruitingSection';
import LockedSection from '../../components/Curation/Locked';
import Header from '../../components/common/Header/Header';
import DotIndicator from '../../components/common/Pagination/DotIndicator';
import LeftSidebar from '../../components/LeftSidebar';

import UpdateRight from '../../assets/icons/UpdateRight.svg';

import { fetchCuratedScholarships } from '../../api/Curation/Curated';
import { postScholarshipEvents } from '../../api/Curation/Events';
import { scrapScholarship, unscrapScholarship } from '../../api/Curation/Scrap';
import { useUserStore } from '../../store/user/user';
import Button from '../../components/Button/Button';
import ChevronRight from '../../assets/icons/ChevronRight';

import type {
  CuratedCampusScholarship,
  CuratedFeaturedScholarship,
  CuratedOtherScholarship,
  CuratedViewMode,
} from '../../types/Curation/Curated';

type ClickableScholarship =
  | CuratedFeaturedScholarship
  | CuratedCampusScholarship
  | CuratedOtherScholarship;

interface MemberCurationPageProps {
  isLoggedIn: boolean;
}

export default function MemberCurationPage({ isLoggedIn }: MemberCurationPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useUserStore((state) => state.user);

  const [featuredScholarships, setFeaturedScholarships] = useState<CuratedFeaturedScholarship[]>(
    [],
  );

  // 지원 가능한 전체 featured 장학금 개수
  const [totalFeaturedCount, setTotalFeaturedCount] = useState(0);

  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  const [profileCompletionRate, setProfileCompletionRate] = useState(0);
  const [viewMode, setViewMode] = useState<CuratedViewMode>('PERSONALIZED');
  const [rankerVersion, setRankerVersion] = useState('');

  const [campusScholarships, setCampusScholarships] = useState<CuratedCampusScholarship[]>([]);

  const [otherScholarships, setOtherScholarships] = useState<CuratedOtherScholarship[]>([]);

  const [ineligibleScholarships, setIneligibleScholarships] = useState<CuratedOtherScholarship[]>(
    [],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isScrapLoading, setIsScrapLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const SLIDE_WIDTH = 1043;

  const isOnboarded = Boolean(user?.onboardingCompleted);
  const isLocked = !isOnboarded;

  useEffect(() => {
    let isCancelled = false;

    const getCuratedScholarships = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const data = await fetchCuratedScholarships({
          category: '전체',
          page: 1,
          size: 10,
        });

        if (isCancelled) return;

        /*
         * PERSONALIZED의 featured는
         * 지원 가능한 전체 장학금 배열.
         *
         * 전체 개수는 따로 저장하고,
         * 메인 캐러셀에는 앞 5개만 보여준다.
         */
        const featured = data.featured ?? [];

        setViewMode(data.viewMode);
        setRankerVersion(data.rankerVersion);
        setTotalFeaturedCount(featured.length);
        setFeaturedScholarships(featured.slice(0, 5));
        setCurrentFeaturedIndex(0);

        setProfileCompletionRate(data.profileCompletionRate);
        setCampusScholarships(data.campusScholarships ?? []);
        setOtherScholarships(data.otherScholarships ?? []);
        setIneligibleScholarships(data.ineligibleScholarships ?? []);
      } catch (error) {
        if (isCancelled) return;

        console.error('맞춤 장학금 조회 실패:', error);

        setFeaturedScholarships([]);
        setTotalFeaturedCount(0);
        setCurrentFeaturedIndex(0);

        setProfileCompletionRate(0);
        setCampusScholarships([]);
        setOtherScholarships([]);
        setIneligibleScholarships([]);

        setErrorMessage(
          error instanceof Error ? error.message : '맞춤 장학금을 불러오지 못했습니다.',
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void getCuratedScholarships();

    return () => {
      isCancelled = true;
    };
  }, [location.key]);

  const handleFeaturedPrev = () => {
    if (featuredScholarships.length === 0) {
      return;
    }

    setCurrentFeaturedIndex((prev) => {
      if (prev === 0) {
        return featuredScholarships.length;
      }

      return prev - 1;
    });
  };

  const handleFeaturedNext = () => {
    if (featuredScholarships.length === 0) {
      return;
    }

    setCurrentFeaturedIndex((prev) => {
      if (prev === featuredScholarships.length) {
        return 0;
      }

      return prev + 1;
    });
  };

  useEffect(() => {
    if (featuredScholarships.length === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentFeaturedIndex((prev) => {
        if (prev === featuredScholarships.length) {
          return 0;
        }

        return prev + 1;
      });
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [featuredScholarships.length]);

  const handleFeaturedDotClick = (index: number) => {
    setCurrentFeaturedIndex(index - 1);
  };

  const handleScholarshipDetailClick = (
    scholarship: ClickableScholarship,
    position: number,
  ) => {
    void postScholarshipEvents([
      {
        scholarshipId: scholarship.scholarshipId,
        eventType: 'CLICK',
        position,
        matchScore: scholarship.matchScore,
        viewMode,
        section: scholarship.section,
        rankerVersion,
      },
    ]).catch((error) => {
      console.error('장학금 클릭 기록 실패:', error);
    });

    navigate(`/curation/${scholarship.scholarshipId}`, {
      state: {
        profileCompletionRate,
      },
    });
  };

  const handleScrapClick = async (scholarshipId: number) => {
    if (isScrapLoading) {
      return;
    }

    const targetScholarship = featuredScholarships.find(
      (scholarship) => scholarship.scholarshipId === scholarshipId,
    );

    if (!targetScholarship) {
      return;
    }

    try {
      setIsScrapLoading(true);

      const result = targetScholarship.isScrapped
        ? await unscrapScholarship(scholarshipId)
        : await scrapScholarship(scholarshipId);

      setFeaturedScholarships((prev) =>
        prev.map((scholarship) =>
          scholarship.scholarshipId === scholarshipId
            ? {
                ...scholarship,
                isScrapped: result.scrapped,
              }
            : scholarship,
        ),
      );
    } catch (error) {
      console.error('추천 장학금 스크랩 변경 실패:', error);

      alert(error instanceof Error ? error.message : '스크랩 상태 변경에 실패했습니다.');
    } finally {
      setIsScrapLoading(false);
    }
  };

  return (
    <div className="h-[1024px] w-[1440px] bg-white font-['Pretendard']">
      <Header
        searchPlaceholder="장학금 찾아보기"
        isLoggedIn={isLoggedIn}
        isSearchMode={false}
        onSearch={(query) => {
          const trimmedQuery = query.trim();

          if (!trimmedQuery) return;

          navigate(`/curation?keyword=${encodeURIComponent(trimmedQuery)}`);
        }}
      />

      <div className="flex">
        <div className="relative ml-[64px] min-h-screen w-[237px] shrink-0">
          <LeftSidebar activeId="curating" />

          {!isOnboarded && (
            // 사이드바 안쪽에 좌·우·아래 16px 씩 들여 놓는다(시안 3345:7681: 패널 237x896, 카드 205).
            //
            // left 를 주지 않는 이유: LeftSidebar 의 aside 와 같은 방식이다. fixed 인데 left 가 auto 면
            // 브라우저가 원래 있어야 할 자리(= 이 열의 왼쪽 끝)를 기준으로 잡아 준다. 예전처럼
            // left-[78px] 로 못 박으면 가운데 정렬 래퍼가 사이드바를 밀 때 카드만 제자리에 남아 어긋났다.
            //
            // top 은 사이드바 기하(top-80, h-896)에서 역산했다: 80 + 896 - 16 - 224 = 736.
            <div className="fixed top-[736px] ml-[16px] z-10 h-[224px] w-[205px] rounded-[16px] bg-white px-[20px] pt-[20px] pb-[16px] shadow-[0_1px_7px_0_rgba(0,0,0,0.08)]">
              <p className="h-[16px] w-[105px] text-[12px] font-medium leading-[16px] text-[#555964]">
                더 정확한 추천을 위해
              </p>

              <p className="h-[50px] w-[135px] text-[18px] font-bold leading-[24px] text-[#10131A]">
                프로필을 업데이트
                <br />
                해보세요!
              </p>

              <div className="invisible mt-[50px]">
                <span className="block h-[16px] text-[12px] font-semibold leading-[16px] text-[#7962ED]">
                  {profileCompletionRate}%
                </span>

                <div className="mt-[4px] h-[4px] w-full overflow-hidden rounded-[8px] bg-[#E6E7EB]">
                  <div
                    className="h-full rounded-[8px] bg-[#7962ED]"
                    style={{
                      width: `${profileCompletionRate}%`,
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/onboarding')}
                className="absolute bottom-[16px] left-[20px] right-[20px] flex h-[32px] items-center justify-between rounded-[8px] bg-[#F3F4F6] px-[16px] text-[12px] font-medium leading-[16px] text-[#747883]"
              >
                <span className="leading-[16px]">프로필 업데이트</span>

                <img src={UpdateRight} alt="오른쪽 화살표" />
              </button>
            </div>
          )}
        </div>

        <main className="flex w-[1139px] flex-col gap-[52px] pt-[16px] pl-[32px] pr-[64px] pb-[64px]">
          <div className="flex w-[1043px] flex-col gap-[32px]">
            <div className="flex w-[1000px] flex-col gap-[4px]">
              <span className="h-[104px] text-[40px] font-bold leading-[52px] text-[#10131A]">
                <span className="text-[#7962ED]">{user?.name ?? '회원'}님</span>
                , 지금 지원 가능한
                <br />
                장학금을 확인해보세요!
              </span>

              <span className="h-[24px] text-[16px] leading-[24px] text-[#555964]">
                마감이 임박한 장학금을 놓치지 마세요.
              </span>
            </div>

            {isLoading && (
              <div className="flex h-[528px] items-center justify-center text-[16px] font-medium text-[#747883]">
                맞춤 장학금을 불러오는 중이에요.
              </div>
            )}

            {!isLoading && errorMessage && (
              <div className="flex h-[528px] items-center justify-center text-[16px] font-medium text-[#747883]">
                {errorMessage}
              </div>
            )}

            {!isLoading && !errorMessage && featuredScholarships.length === 0 && (
              <div className="flex h-[528px] items-center justify-center text-[16px] font-medium text-[#747883]">
                아직 추천할 장학금이 없어요.
              </div>
            )}

            {!isLoading && !errorMessage && featuredScholarships.length > 0 && (
              <>
                <div className="w-[1043px] overflow-hidden rounded-[16px]">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${currentFeaturedIndex * SLIDE_WIDTH}px)`,
                    }}
                  >
                    {featuredScholarships.map((scholarship, index) => (
                      <div key={scholarship.scholarshipId} className="w-[1043px] shrink-0">
                        <RecommendCard
                          scholarship={scholarship}
                          onDetailClick={() =>
                            handleScholarshipDetailClick(scholarship, index + 1)
                          }
                          onScrapClick={handleScrapClick}
                          onPrev={handleFeaturedPrev}
                          onNext={handleFeaturedNext}
                          isScrapLoading={isScrapLoading}
                        />
                      </div>
                    ))}

                    {isOnboarded && (
                      <div className="w-[1043px] shrink-0">
                        <div
                          onClick={(event) => {
                            const target = event.target as HTMLElement;

                            if (target.closest('button, a')) {
                              return;
                            }

                            const cardRect = event.currentTarget.getBoundingClientRect();

                            const cardCenterX = cardRect.left + cardRect.width / 2;

                            if (event.clientX < cardCenterX) {
                              handleFeaturedPrev();
                              return;
                            }

                            handleFeaturedNext();
                          }}
                          className="flex h-[528px] w-[1043px] cursor-pointer items-center justify-center rounded-[16px] border border-[#E6E7EB] bg-white"
                        >
                          <div className="flex flex-col items-center">
                            <h2 className="h-[40px] w-[400px] text-center text-[28px] font-bold leading-[40px] text-[#10131A]">
                              지원 가능한 더 많은 장학금 확인하기
                            </h2>

                            <p className="h-[24px] whitespace-nowrap text-center text-[16px] font-medium leading-[24px] text-[#555964]">
                              {user?.name ?? '회원'}님이 지원 가능한 {totalFeaturedCount}종의
                              장학금을 더 확인해보세요.
                            </p>

                            <Button
                              size="md"
                              variant="primary"
                              weight="medium"
                              width="228px"
                              paddingLeft="16px"
                              paddingRight="16px"
                              iconGap={12}
                              rightIcon={<ChevronRight />}
                              className="mt-[24px] leading-[26px]"
                              onClick={() => navigate('/curation/recommended')}
                            >
                              장학금 확인하러 가기
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center">
                  <DotIndicator
                    total={featuredScholarships.length + 1}
                    current={currentFeaturedIndex + 1}
                    onDotClick={handleFeaturedDotClick}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex w-[1043px] flex-col gap-[16px]">
            <div className="flex flex-col gap-[4px]">
              <h2 className="text-[32px] font-bold leading-[40px] text-[#10131A]">
                우리 학교 장학금
              </h2>

              <p className="text-[16px] font-medium leading-[24px] text-[#555964]">
                나에게 맞는 교내 장학금
              </p>
            </div>

            <LockedSection isLocked={isLocked}>
              <SchoolSection
                scholarships={campusScholarships}
                onDetailClick={handleScholarshipDetailClick}
              />
            </LockedSection>
          </div>

          <div className="flex w-[1043px] flex-col gap-[16px]">
            <div className="flex flex-col gap-[4px]">
              <h2 className="h-[40px] text-[28px] font-bold leading-[40px] text-[#10131A]">
                조건에 맞지 않지만, 현재 모집 중인 장학금
              </h2>

              <p className="text-[16px] font-medium leading-[24px] text-[#555964]">
                지원 조건이 일부 다르더라도 도전해 볼 만한 장학금을 확인해보세요.
              </p>
            </div>

            <LockedSection isLocked={isLocked}>
              <RecruitingSection
                scholarships={
                  ineligibleScholarships.length > 0 ? ineligibleScholarships : otherScholarships
                }
                onDetailClick={handleScholarshipDetailClick}
              />
            </LockedSection>
          </div>
        </main>
      </div>
    </div>
  );
}
