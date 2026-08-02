import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import profileIcon from '../assets/profile.svg';
import gradeIcon from '../assets/grade.svg';
import avgGpaIcon from '../assets/avg-gpa.svg';
import moneyIcon from '../assets/money.svg';
import heartIcon from '../assets/heart.svg';
import infoIcon from '../assets/lucide/info.svg';
import logOutIcon from '../assets/lucide/log-out.svg';
import logOutIcon1 from '../assets/lucide/log-out-1.svg';
import chevronRightIcon from '../assets/icons/chevron.right.svg';
import LeftSidebar from '../components/LeftSidebar';
import Header from '../components/common/Header/Header';
import { useUserStore } from '../store/user/user';
import { tokenStorage } from '../utils/token';
// import { logout } from '../api/login/auth';
import { getMyPageSummary } from '../api/mypage/mypage';
import type { MyPageSummary } from '../types/mypage/mypage';
import { logout } from '../api/login/auth';
import { getMyProfile } from '../api/onboarding/profile';
import type { FullProfile } from '../types/onboarding/profile';

// API 응답을 받아오기 전/실패했을 때 보여줄 기본값
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

type UserProfileView = typeof DEFAULT_USER_PROFILE;

// "3학년" 같은 문자열에서 학년 숫자만 추출
function extractGradeNumber(grade: string): number {
  const match = grade.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

// "3분위" 같은 문자열에서 소득분위 숫자만 추출
function extractIncomeDecile(incomeLevel: string): number {
  const match = incomeLevel.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

// "생활비 지원", "해외연수 / 교환학생" 같은 관심분야 라벨을
// "#생활비", "#해외연수" 같은 해시태그 형태로 축약
// (정확한 표시 규칙은 디자인 확인 필요 — 우선 첫 단어만 사용)
function toHashtag(label: string): string {
  const firstWord = label.split(/[ /]/)[0];
  return `#${firstWord}`;
}

function mapSummaryToView(summary: MyPageSummary): UserProfileView {
  return {
    name: summary.name,
    birthYear: Number(summary.birthYear),
    region: summary.region,
    grade: extractGradeNumber(summary.recommendationCriteria.grade),
    gpa: summary.recommendationCriteria.gpa,
    gpaMax: 4.5,
    incomeDecile: extractIncomeDecile(summary.recommendationCriteria.incomeLevel),
    interests: summary.recommendationCriteria.interests.map(toHashtag),
  };
}

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
  // API 응답이 오기 전까지는 기본값으로 화면을 보여주고,
  // 응답이 오면 실제 값으로 교체
  const [userProfile, setUserProfile] = useState<UserProfileView>(DEFAULT_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();
  const clearUser = useUserStore((s) => s.clearUser);

  // 로그아웃: 서버에 refreshToken 폐기 요청(accessToken 필요) → 전역 유저 상태 초기화
  // → 저장된 토큰 삭제 → 로그인 페이지로 이동.
  // 서버 요청이 실패(토큰 만료 등)해도 클라이언트 로그아웃은 그대로 진행한다.
  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // 서버 로그아웃 실패는 무시하고 클라이언트 정리는 계속 진행
    } finally {
      clearUser();
      tokenStorage.clearTokens();
      navigate('/login');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyPageSummary();
        setUserProfile(mapSummaryToView(res.data.data));
      } catch (err) {
        console.error('마이페이지 요약 정보 조회 실패:', err);
        setLoadError('프로필 정보를 불러오지 못했어요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="relative left-1/2 w-[1440px] -ml-[50vw] h-[1024px] bg-white text-left font-['Pretendard',sans-serif]">
      <div className="mx-auto w-full">
        {/* 상단바 */}
        <header className="">
          <Header logoOnly={true} />
        </header>

        <div className="flex">
          <aside className="ml-[64px] mr-[32px]">
            <LeftSidebar activeId="mypage" />
          </aside>

          {/* 본문 */}
          <main className="flex flex-col gap-12">
            <div className="flex w-full flex-col gap-[28px]">
              {/* 페이지 타이틀  */}
              <div className="flex w-full flex-col items-start gap-1">
                <h1 className="text-[36px] font-[700] text-[#10131A]">마이페이지</h1>
                <p className="text-[16px] font-medium text-[#555964]">
                  내 정보를 관리하고, 맞춤 추천 기준을 확인해보세요.
                </p>
              </div>

              {loadError && (
                <div className="flex w-[1020px] items-center gap-2 rounded-lg bg-[#FEF2F2] px-6 py-3">
                  <p className="text-[14px] font-medium leading-5 text-[#FA5862]">{loadError}</p>
                </div>
              )}

              <div className={`flex w-full flex-col gap-4 ${isLoading ? 'opacity-60' : ''}`}>
                {/* 프로필 카드 */}
                <section className="flex w-[1020px] flex-col gap-3 rounded-2xl border border-[#D2D4DA] p-6">
                  <div className="flex w-full items-start justify-between">
                    <h2 className="text-left text-[20px] font-semibold leading-7 tracking-[-0.1px] text-[#0A0C11]">
                      프로필
                    </h2>
                    <button
                      type="button"
                      onClick={() => navigate('/mypage/edit')}
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
                    <button
                      type="button"
                      className="flex w-full items-center justify-between"
                      onClick={handleLogout}
                    >
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
                        <span
                          className="text-[16px] font-medium leading-6 text-[#747883]"
                          onClick={() => navigate('/sign')}
                        >
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
    </div>
  );
}
