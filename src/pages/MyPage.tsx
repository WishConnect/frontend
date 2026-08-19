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
import deleteIcon from '../assets/icons/delete.svg';
import chevronRightIcon from '../assets/icons/chevron.right.svg';
import LeftSidebar from '../components/LeftSidebar';
import Header from '../components/common/Header/Header';
import { useUserStore } from '../store/user/user';
import { tokenStorage } from '../utils/token';
import { logout } from '../api/login/auth';
import { getMyPageSummary, deleteMyAccount } from '../api/mypage/mypage';
import type { MyPageSummary } from '../types/mypage/mypage';
import { formatRegionLabel } from '../utils/region';

// API 응답을 받아오기 전/실패했을 때, 그리고 온보딩 미완료로 추천기준이 없을 때 보여줄 기본값
const DEFAULT_USER_PROFILE = {
  name: '김위시',
  birthYear: 2004,
  region: '서울시 강남구',
  grade: 0,
  gpa: 0,
  gpaMax: 4.5,
  incomeDecile: 0,
  interests: [] as string[],
};

type UserProfileView = typeof DEFAULT_USER_PROFILE;

// "2004" 뿐 아니라 "2004-01-01", "2004.01.01" 같은 날짜 형식으로 와도
// 앞 4자리 연도만 뽑아낸다. Number(summary.birthDate)를 바로 쓰면
// 날짜 형식일 때 NaN이 되는 문제가 있어 정규식으로 안전하게 처리.
function extractBirthYear(birthDate: string | null | undefined): number {
  if (!birthDate) return 0;
  const match = birthDate.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

// "3학년" 같은 문자열에서 학년 숫자만 추출. null/빈 값이면 0
function extractGradeNumber(grade: string | null): number {
  if (!grade) return 0;
  const match = grade.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

// "3분위" 같은 문자열에서 소득분위 숫자만 추출. null/빈 값이면 0
// (소득분위를 "모름"으로 저장한 유저는 서버가 incomeLevel을 null로 내려줌)
function extractIncomeDecile(incomeLevel: string | null): number {
  if (!incomeLevel) return 0;
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

// 온보딩을 아직 완료하지 않은 유저는 recommendationCriteria 전체가 null로 오고,
// 완료했더라도 특정 항목(예: 소득분위 "모름")만 개별적으로 null일 수 있으므로
// criteria 객체 존재 여부와 별개로 각 필드를 따로 방어한다.
// 참고: API 응답 필드명은 birthYear가 아니라 birthDate.
function mapSummaryToView(summary: MyPageSummary): UserProfileView {
  const criteria = summary.recommendationCriteria;

  return {
    name: summary.name,
    birthYear: extractBirthYear(summary.birthDate),
    // 서버가 "서울 중구"/"서울" 문자열로도, 지역 객체로도 줄 수 있어 한 줄 문자열로 통일해서 쓴다.
    region: formatRegionLabel(summary.region),
    grade: extractGradeNumber(criteria?.grade ?? null),
    gpa: criteria?.gpa ?? 0,
    gpaMax: 4.5,
    incomeDecile: extractIncomeDecile(criteria?.incomeLevel ?? null),
    interests: (criteria?.interests ?? []).map(toHashtag),
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
  const [isOnboardingIncomplete, setIsOnboardingIncomplete] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const navigate = useNavigate();
  const clearUser = useUserStore((s) => s.clearUser);
  // 소셜(카카오/구글) 로그인 사용자는 비밀번호가 없으므로 비밀번호 변경 항목을 숨긴다.
  const isSocialUser = !!useUserStore((s) => s.user?.loginType);

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

  // 회원 탈퇴: 되돌릴 수 없는 작업이라 확인창을 한 번 거친 뒤 진행.
  // 성공하면 로그아웃과 동일하게 전역 상태/토큰을 정리하고 로그인 화면으로 이동.
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('정말로 회원 탈퇴하시겠어요? 이 작업은 되돌릴 수 없어요.');
    if (!confirmed) return;

    setIsDeletingAccount(true);
    setDeleteAccountError(null);

    try {
      await deleteMyAccount();
      clearUser();
      tokenStorage.clearTokens();
      navigate('/login');
    } catch (err) {
      console.error('회원 탈퇴 실패:', err);
      setDeleteAccountError('회원 탈퇴에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyPageSummary();
        setUserProfile(mapSummaryToView(res.data.data));
        setIsOnboardingIncomplete(res.data.data.recommendationCriteria === null);
      } catch (err) {
        console.error('마이페이지 요약 정보 조회 실패:', err);
        setLoadError('프로필 정보를 불러오지 못했어요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 가운데 정렬은 App의 공통 래퍼(mx-auto + max-w-[1440px])가 맡는다.
  // 예전에는 여기서 left-1/2 + -ml-[50vw]로 부모 폭을 뚫고 뷰포트 기준 정렬을 했는데,
  // 공통 래퍼가 생긴 뒤로는 보정이 두 번 걸려 화면이 왼쪽으로 밀렸다. 다른 페이지와 같은 방식으로 맞춤.
  return (
    <div className="w-[1440px] h-[1024px] bg-white text-left font-['Pretendard',sans-serif]">
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
                        <p className="text-left">
                          {userProfile.birthYear > 0
                            ? `${userProfile.birthYear}년 출생`
                            : '출생년도 정보 없음'}
                        </p>
                        <p className="text-left">
                          {userProfile.region
                            ? `${userProfile.region} 거주`
                            : '거주 지역 정보 없음'}
                        </p>
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
                      onClick={() => navigate('/onboarding')}
                      style={{ border: '1px solid #9DA1AC' }}
                      className="flex h-9 shrink-0 items-center justify-center gap-1 rounded-lg bg-white px-4 py-2 text-[14px] font-medium leading-5 text-[#555964]"
                    >
                      <PencilIcon />
                      추천 기준 수정하기
                    </button>
                  </div>

                  {/* 온보딩 미완료 시 안내 배너 — 하드코딩처럼 보이는 0/빈값 대신 명확한 안내 표시 */}
                  {isOnboardingIncomplete ? (
                    <div className="flex w-full items-center gap-2 rounded-lg bg-[#F9FAFC] px-6 py-3">
                      <img src={infoIcon} alt="" className="size-[18px] shrink-0" />
                      <p className="flex-1 text-left text-[16px] font-medium leading-6 text-[#747883]">
                        아직 온보딩을 완료하지 않았어요. 온보딩을 완료하면 맞춤 추천 기준을 확인할
                        수 있어요.
                      </p>
                    </div>
                  ) : (
                    <>
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
                                {userProfile.incomeDecile > 0
                                  ? `${userProfile.incomeDecile}분위`
                                  : '모름'}
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
                    </>
                  )}
                </section>

                {/* 계정관리 */}
                <section className="flex w-full flex-col gap-6 rounded-2xl border border-[#D2D4DA] p-6">
                  <h2 className="text-left text-[20px] font-semibold leading-7 tracking-[-0.1px] text-[#0A0C11]">
                    계정관리
                  </h2>
                  {deleteAccountError && (
                    <div className="flex w-full items-center gap-2 rounded-lg bg-[#FEF2F2] px-6 py-3">
                      <p className="text-[14px] font-medium leading-5 text-[#FA5862]">
                        {deleteAccountError}
                      </p>
                    </div>
                  )}
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

                    {/* 원래 "회원가입"으로 되어있던 항목 — 로그인된 유저에게 회원가입 링크는
                        의미가 없고, 비밀번호 변경 필드는 /mypage/edit(EditProfile.tsx)에 이미
                        있으므로 "비밀번호 변경"으로 바꾸고 그 페이지로 연결.
                        (참고: 원래 코드는 onClick이 바깥 button이 아니라 안쪽 span에만 걸려있어
                        아이콘/여백 클릭 시 반응이 없던 버그가 있었음 — button으로 옮겨서 수정)
                        소셜 로그인 사용자는 비밀번호가 없으므로 이 항목 자체를 숨긴다. */}
                    {!isSocialUser && (
                      <>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between"
                          onClick={() => navigate('/mypage/edit')}
                        >
                          <div className="flex items-center gap-6">
                            <img src={logOutIcon1} alt="" className="size-8" />
                            <span className="text-[16px] font-medium leading-6 text-[#747883]">
                              비밀번호 변경
                            </span>
                          </div>
                          <img src={chevronRightIcon} alt="" className="size-4" />
                        </button>

                        <div className="h-px w-full bg-[#D2D4DA]" />
                      </>
                    )}

                    <button
                      type="button"
                      className="flex w-full items-center justify-between disabled:opacity-60"
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount}
                    >
                      <div className="flex items-center gap-6">
                        <img src={deleteIcon} alt="" className="size-8" />
                        <span className="text-[16px] font-medium leading-6 text-[#747883]">
                          {isDeletingAccount ? '탈퇴 처리 중...' : '회원탈퇴'}
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
