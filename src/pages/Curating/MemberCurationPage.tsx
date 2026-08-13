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
import { scrapScholarship, unscrapScholarship } from '../../api/Curation/Scrap';
import { useUserStore } from '../../store/user/user';
import Button from '../../components/Button/Button';
import ChevronRight from '../../assets/icons/ChevronRight';

import type {
  CuratedCampusScholarship,
  CuratedFeaturedScholarship,
  CuratedOtherScholarship,
} from '../../types/Curation/Curated';

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

  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  const [profileCompletionRate, setProfileCompletionRate] = useState(0);

  const [campusScholarships, setCampusScholarships] = useState<CuratedCampusScholarship[]>([]);

  const [otherScholarships, setOtherScholarships] = useState<CuratedOtherScholarship[]>([]);

  const [ineligibleScholarships, setIneligibleScholarships] = useState<CuratedOtherScholarship[]>(
    [],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isScrapLoading, setIsScrapLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const featured = featuredScholarships[currentFeaturedIndex] ?? null;
  const isMoreSlide = currentFeaturedIndex === featuredScholarships.length;
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

        setFeaturedScholarships((data.featured ?? []).slice(0, 5));
        setCurrentFeaturedIndex(0);

        setProfileCompletionRate(data.profileCompletionRate);
        setCampusScholarships(data.campusScholarships ?? []);
        setOtherScholarships(data.otherScholarships ?? []);
        setIneligibleScholarships(data.ineligibleScholarships ?? []);
      } catch (error) {
        if (isCancelled) return;

        console.error('맞춤 장학금 조회 실패:', error);

        setFeaturedScholarships([]);
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

  const handleFeaturedDotClick = (index: number) => {
    setCurrentFeaturedIndex(index - 1);
  };

  const handleScholarshipDetailClick = (scholarshipId: number) => {
    navigate(`/curation/${scholarshipId}`, {
      state: {
        profileCompletionRate,
      },
    });
  };

  const handleDetailClick = () => {
    if (!featured) return;

    handleScholarshipDetailClick(featured.scholarshipId);
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
            <div className="fixed bottom-[16px] left-[78px] z-10 h-[224px] w-[208px] rounded-[16px] bg-white px-[20px] pt-[20px] pb-[16px] shadow-[0_1px_7px_0_rgba(0,0,0,0.08)]">
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

                <div className="mt-[4px] h-[4px] w-[168px] overflow-hidden rounded-[8px] bg-[#E6E7EB]">
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
                className="absolute bottom-[16px] left-[20px] flex h-[32px] w-[168px] items-center justify-between rounded-[8px] bg-[#F3F4F6] px-[16px] text-[12px] font-medium leading-[16px] text-[#747883]"
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
                {isMoreSlide ? (
                  <div
                    onClick={(event) => {
                      const target = event.target as HTMLElement;

                      // 버튼을 클릭했을 때는 슬라이드가 넘어가지 않음
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
                        {user?.name ?? '회원'}님이 지원가능한 50종의 장학금을 더 확인해보세요.
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
                ) : (
                  featured && (
                    <RecommendCard
                      scholarship={featured}
                      onDetailClick={handleDetailClick}
                      onScrapClick={handleScrapClick}
                      onPrev={handleFeaturedPrev}
                      onNext={handleFeaturedNext}
                      isScrapLoading={isScrapLoading}
                    />
                  )
                )}

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
              />
            </LockedSection>
          </div>
        </main>
      </div>
    </div>
  );
}
