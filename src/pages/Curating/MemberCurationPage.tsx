import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import RecommendCard from '../../components/Curation/RecommendCard';
import SchoolSection from '../../components/Curation/SchoolSection';
import RecruitingSection from '../../components/Curation/RecruitingSection';
import LockedSection from '../../components/Curation/Locked';
import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar';

import UpdateRight from '../../assets/icons/UpdateRight.svg';

import { fetchCuratedScholarships } from '../../api/Curation/Curated';
import { scrapScholarship, unscrapScholarship } from '../../api/Curation/Scrap';
import { useUserStore } from '../../store/user/user';

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

  const [featured, setFeatured] = useState<CuratedFeaturedScholarship | null>(null);

  const [profileCompletionRate, setProfileCompletionRate] = useState(0);

  const [campusScholarships, setCampusScholarships] = useState<CuratedCampusScholarship[]>([]);

  const [otherScholarships, setOtherScholarships] = useState<CuratedOtherScholarship[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isScrapLoading, setIsScrapLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

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

        setFeatured(data.featured);
        setProfileCompletionRate(data.profileCompletionRate);
        setCampusScholarships(data.campusScholarships ?? []);
        setOtherScholarships(data.otherScholarships ?? []);
      } catch (error) {
        if (isCancelled) return;

        console.error('맞춤 장학금 조회 실패:', error);

        setFeatured(null);
        setProfileCompletionRate(0);
        setCampusScholarships([]);
        setOtherScholarships([]);

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
    if (!featured || isScrapLoading) {
      return;
    }

    try {
      setIsScrapLoading(true);

      const result = featured.isScrapped
        ? await unscrapScholarship(scholarshipId)
        : await scrapScholarship(scholarshipId);

      setFeatured((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          isScrapped: result.scrapped,
        };
      });
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
        <div className="relative ml-[64px] h-[896px] w-[237px] shrink-0 self-start">
          <LeftSidebar activeId="curating" />

          {!isOnboarded && (
            <div className="absolute bottom-[16px] left-[14px] z-10 h-[224px] w-[208px] rounded-[16px] bg-white px-[20px] pt-[20px] pb-[16px] shadow-[0_1px_7px_0_rgba(0,0,0,0.08)]">
              <p className="h-[16px] w-[105px] text-[12px] font-medium leading-[16px] text-[#555964]">
                더 정확한 추천을 위해
              </p>

              <p className="h-[50px] w-[135px] text-[18px] font-bold leading-[24px] text-[#10131A]">
                프로필을 업데이트
                <br />
                해보세요!
              </p>

              <div className="mt-[50px]">
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

        <main className="flex w-[1139px] flex-col gap-[52px] pl-[32px] pr-[64px] pb-[64px]">
          <div className="flex w-[1043px] flex-col gap-[32px]">
            <div className="flex w-[420px] flex-col gap-[4px]">
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

            {!isLoading && !errorMessage && !featured && (
              <div className="flex h-[528px] items-center justify-center text-[16px] font-medium text-[#747883]">
                아직 추천할 장학금이 없어요.
              </div>
            )}

            {!isLoading && !errorMessage && featured && (
              <RecommendCard
                scholarship={featured}
                onDetailClick={handleDetailClick}
                onScrapClick={handleScrapClick}
                isScrapLoading={isScrapLoading}
              />
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
              <RecruitingSection scholarships={otherScholarships} />
            </LockedSection>
          </div>
        </main>
      </div>
    </div>
  );
}
