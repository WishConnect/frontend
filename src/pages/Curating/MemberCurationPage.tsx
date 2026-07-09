import { useState } from 'react';
import { memberCurationMock } from '../../mock/memberCuration';
import RecommendCard from '../../components/Curation/RecommendCard';
import SchoolSection from '../../components/Curation/SchoolSection';
import RecruitingSection from '../../components/Curation/RecruitingSection';
import LockedSection from '../../components/Curation/Locked';

export default function MemberCurationPage() {
  const { member, recommendedScholarships, schoolScholarships, recruitingScholarships } =
    memberCurationMock;
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLocked = !member.isOnboarded;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? recommendedScholarships.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === recommendedScholarships.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="h-[1024px] w-[1440px] bg-white font-['Pretendard']">
      <header className="h-[80px]">{/* Header */}</header>

      <div className="mt-[16px] flex">
        <aside className="w-[237px]">{/* Sidebar */}</aside>

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
