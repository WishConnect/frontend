import { useState } from 'react';
import { memberCurationMock } from '../../mock/memberCuration';
import RecommendCard from '../../components/Curation/RecommendCard';
import SchoolSection from '../../components/Curation/SchoolSection';
import RecruitingSection from '../../components/Curation/RecruitingSection';
import LockedSection from '../../components/Curation/Locked';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar';
import UpdateRight from '../../assets/icons/UpdateRight.svg';

// 헤더의 로그인/비로그인 표시는 Header가 유저 스토어를 보고 처리하므로 isLoggedIn을 넘기지 않음
export default function MemberCurationPage() {
  const { member, schoolScholarships, recruitingScholarships } = memberCurationMock;

  const [recommendedScholarships, setRecommendedScholarships] = useState(
    memberCurationMock.recommendedScholarships,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLocked = !member.isOnboarded;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? recommendedScholarships.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === recommendedScholarships.length - 1 ? 0 : prev + 1));
  };
  const handleScrapToggle = (id: number) => {
    setRecommendedScholarships((prev) =>
      prev.map((scholarship) =>
        scholarship.id === id
          ? {
              ...scholarship,
              isScrapped: !scholarship.isScrapped,
            }
          : scholarship,
      ),
    );
  };
  const navigate = useNavigate();
  const handleDetailClick = () => {
    navigate(`/curation/${recommendedScholarships[currentIndex].id}`);
  };
  return (
    <div className="h-[1024px] w-[1440px] bg-white font-['Pretendard']">
      <Header
        searchPlaceholder="장학금 찾아보기"
        isSearchMode={false}
        onSearch={(query) => {
          navigate(`/curation?keyword=${query}`);
        }}
      />

      <div className="flex">
        <div className="relative ml-[64px] h-[896px] w-[237px] shrink-0 self-start">
          <LeftSidebar activeId="curating" />

          {!member.isOnboarded && (
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
                  {member.profileProgress}%
                </span>

                <div className="mt-[4px] h-[4px] w-[168px] overflow-hidden rounded-[8px] bg-[#E6E7EB]">
                  <div
                    className="h-full rounded-[8px] bg-[#7962ED]"
                    style={{
                      width: `${member.profileProgress}%`,
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigate('/onboarding');
                }}
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
                <span className="text-[#7962ED]">{member.name}님</span>, 지금 지원 가능한
                <br />
                장학금을 확인해보세요!
              </span>

              <span className="h-[24px] text-[16px] leading-[24px] text-[#555964]">
                마감이 임박한 장학금을 놓치지 마세요.
              </span>
            </div>

            <div className="flex flex-col gap-[32px]">
              <RecommendCard
                scholarship={recommendedScholarships[currentIndex]}
                onPrev={handlePrev}
                onNext={handleNext}
                onDetailClick={handleDetailClick}
                onScrapToggle={handleScrapToggle}
              />
              <div className="flex justify-center gap-[8px]">
                {recommendedScholarships.map((scholarship, index) => (
                  <button
                    key={scholarship.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`h-[8px] w-[8px] rounded-full ${
                      currentIndex === index ? 'bg-[#7962ED]' : 'bg-[#D2D4DA]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 우리 학교 장학금 */}
          <div className="flex w-[1043px] flex-col gap-[16px]">
            <div className="flex flex-col gap-[4px]">
              <h2 className="text-[32px] font-bold leading-[40px] text-[#10131A]">
                우리 학교 장학금
              </h2>

              <p className="text-[16px] font-medium leading-[24px] text-[#555964]">
                {member.university} 학생을 위한 교내 장학금
              </p>
            </div>

            <LockedSection isLocked={isLocked}>
              <SchoolSection scholarships={schoolScholarships} />
            </LockedSection>
          </div>

          {/* 현재 모집 중 장학금 */}
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
              <RecruitingSection scholarships={recruitingScholarships} />
            </LockedSection>
          </div>
        </main>
      </div>
    </div>
  );
}
