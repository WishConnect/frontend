import { useState } from 'react';
import logo from '../assets/logo.svg';
import profileIcon from '../assets/profile.svg';
import gradeIcon from '../assets/grade.svg';
import avgGpaIcon from '../assets/avg-gpa.svg';
import moneyIcon from '../assets/money.svg';
import heartIcon from '../assets/heart.svg';
import infoIcon from '../assets/lucide/info.svg';
import logOutIcon from '../assets/lucide/log-out.svg';
import logOutIcon1 from '../assets/lucide/log-out-1.svg';
import chevronRightIcon from '../assets/icons/chevron.right.svg';

// 지금은 하드코딩된 기본값이지만, 추후 로그인/API 응답으로 이 객체를 채우면 됩니다.
const DEFAULT_USER_PROFILE = {
  name: '김위시',
  birthYear: 2004,
  region: '서울시 강남구',
  grade: 3,
  gpa: 4.1,
  gpaMax: 4.5,
  incomeDecile: 3,
  interests: ['#생활비', '#등록금', '#창업', '#IT/개발'],
};

function PencilIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

export default function MyPage() {
  // 나중에 로그인한 사용자의 실제 데이터로 교체될 state입니다.
  // 지금은 DEFAULT_USER_PROFILE로 초기화해서 화면에 표시합니다.
  const [userProfile, setUserProfile] = useState(DEFAULT_USER_PROFILE);

  return (
    <div className="relative left-1/2 w-screen -ml-[50vw] min-h-screen bg-white text-left font-['Pretendard',sans-serif]">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* 상단바 */}
        <header className="h-20 w-full">
          <div className="flex h-full items-center px-16">
            <img src={logo} alt="WISHCONNECT" className="h-8" />
          </div>
        </header>

        {/* 본문 */}
        <main className="flex flex-col gap-12 px-[109px] pb-12 pt-8">
          <div className="flex w-full flex-col gap-12">
            {/* 페이지 타이틀  */}
            <div className="flex w-full flex-col items-start gap-1">
              <h1 className="w-full text-left text-[36px] font-bold leading-[48px] tracking-[-0.54px] text-[#10131A]">
                마이페이지
              </h1>
              <p className="w-full text-left text-[16px] font-medium leading-6 text-[#555964]">
                내 정보를 관리하고, 맞춤 추천 기준을 확인해보세요.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4">
              {/* 프로필 카드 */}
              <section className="flex w-full flex-col gap-3 rounded-2xl border border-[#D2D4DA] p-6">
                <div className="flex w-full items-start justify-between">
                  <h2 className="text-left text-[20px] font-semibold leading-7 tracking-[-0.1px] text-[#0A0C11]">
                    프로필
                  </h2>
                  <button
                    type="button"
                    style={{ border: '1px solid #9DA1AC' }}
                    className="flex h-9 shrink-0 items-center justify-center gap-1 rounded-lg bg-white px-4 py-2 text-[14px] font-medium leading-5 text-[#555964]"
                  >
                    <PencilIcon />
                    프로필 수정하기
                  </button>
                </div>
                <div className="flex w-full items-center gap-9">
                  <img src={profileIcon} alt="" className="size-[100px] shrink-0" />
                  <div className="flex flex-col items-start gap-2 text-left">
                    <p className="whitespace-nowrap text-left text-[28px] font-bold leading-10 tracking-[-0.28px] text-[#0A0C11]">
                      {userProfile.name}님
                    </p>
                    <div className="flex flex-col items-start gap-1 whitespace-nowrap text-left text-[16px] font-medium leading-6 text-[#747883]">
                      <p className="text-left">{userProfile.birthYear}년 출생</p>
                      <p className="text-left">{userProfile.region} 거주</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 현재 추천 기준 */}
              <section className="flex w-full flex-col gap-6 rounded-2xl border border-[#D2D4DA] p-6">
                <div className="flex w-full items-start justify-between">
                  <div className="flex flex-1 flex-col items-start gap-1 text-left">
                    <h2 className="w-full text-left text-[20px] font-semibold leading-7 tracking-[-0.1px] text-[#0A0C11]">
                      현재 추천 기준
                    </h2>
                    <p className="w-full text-left text-[16px] font-medium leading-6 text-[#555964]">
                      입력한 정보를 바탕으로 맞춤 장학금을 추천하고 있어요.
                    </p>
                  </div>
                  <button
                    type="button"
                    style={{ border: '1px solid #9DA1AC' }}
                    className="flex h-9 shrink-0 items-center justify-center gap-1 rounded-lg bg-white px-4 py-2 text-[14px] font-medium leading-5 text-[#555964]"
                  >
                    <PencilIcon />
                    추천 기준 수정하기
                  </button>
                </div>

                <div className="flex w-full flex-col gap-6">
                  <div className="flex w-full items-start gap-6">
                    <div className="flex h-[104px] flex-1 items-center justify-start gap-6">
                      <img src={gradeIcon} alt="" className="size-20 shrink-0" />
                      <div className="flex w-[104px] shrink-0 flex-col items-start gap-1 text-left text-[16px]">
                        <p className="w-full text-left font-medium leading-6 text-[#747883]">
                          학년
                        </p>
                        <p className="w-full text-left font-semibold leading-6 text-[#0A0C11]">
                          {userProfile.grade}학년
                        </p>
                      </div>
                    </div>
                    <div className="flex h-[104px] flex-1 items-center justify-start gap-6">
                      <img src={avgGpaIcon} alt="" className="size-20 shrink-0" />
                      <div className="flex w-[104px] shrink-0 flex-col items-start gap-1 text-left text-[16px]">
                        <p className="w-full text-left font-medium leading-6 text-[#747883]">
                          학점
                        </p>
                        <p className="w-full text-left font-semibold leading-6 text-[#0A0C11]">
                          {userProfile.gpa}/{userProfile.gpaMax}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full items-start gap-6">
                    <div className="flex h-[104px] flex-1 items-center justify-start gap-6">
                      <img src={moneyIcon} alt="" className="size-20 shrink-0" />
                      <div className="flex w-[104px] shrink-0 flex-col items-start gap-1 text-left text-[16px]">
                        <p className="w-full text-left font-medium leading-6 text-[#747883]">
                          소득분위
                        </p>
                        <p className="w-full text-left font-semibold leading-6 text-[#0A0C11]">
                          {userProfile.incomeDecile}분위
                        </p>
                      </div>
                    </div>
                    <div className="flex h-[104px] flex-1 items-center justify-start gap-6">
                      <img src={heartIcon} alt="" className="size-20 shrink-0" />
                      <div className="flex flex-1 flex-col items-start gap-1 text-left">
                        <p className="w-full text-left text-[16px] font-medium leading-6 text-[#747883]">
                          관심분야
                        </p>
                        <div className="flex w-full flex-wrap items-start justify-start gap-1">
                          {userProfile.interests.map((tag) => (
                            <span
                              key={tag}
                              className="flex h-6 items-center justify-center rounded-2xl border border-[#BDB9F9] bg-[#7962ED]/10 px-3 py-1 text-[12px] font-medium leading-4 text-[#320095]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex w-full items-center gap-2 rounded-lg bg-[#F9FAFC] px-6 py-3">
                  <img src={infoIcon} alt="" className="size-[18px] shrink-0" />
                  <p className="flex-1 text-left text-[16px] font-medium leading-6 text-[#747883]">
                    추천 기준을 수정하면 더 정확한 맞춤 장학금을 확인할 수 있어요.
                  </p>
                </div>
              </section>

              {/* 계정관리 */}
              <section className="flex w-full flex-col gap-6 rounded-2xl border border-[#D2D4DA] p-6">
                <h2 className="text-left text-[20px] font-semibold leading-7 tracking-[-0.1px] text-[#0A0C11]">
                  계정관리
                </h2>
                <div className="flex w-full flex-col gap-4">
                  <button type="button" className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-6">
                      <img src={logOutIcon} alt="" className="size-8" />
                      <span className="text-[16px] font-medium leading-6 text-[#747883]">
                        로그아웃
                      </span>
                    </div>
                    <img src={chevronRightIcon} alt="" className="size-4" />
                  </button>

                  <div className="h-px w-full bg-[#D2D4DA]" />

                  <button type="button" className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-6">
                      <img src={logOutIcon1} alt="" className="size-8" />
                      <span className="text-[16px] font-medium leading-6 text-[#747883]">
                        회원가입
                      </span>
                    </div>
                    <img src={chevronRightIcon} alt="" className="size-4" />
                  </button>
                </div>
              </section>
            </div>
          </div>

          <p className="w-full text-center text-[16px] font-medium leading-6 text-[#9DA1AC]">
            © 2026 WISHCONNECT. All rights reserved.
          </p>
        </main>
      </div>
    </div>
  );
}
