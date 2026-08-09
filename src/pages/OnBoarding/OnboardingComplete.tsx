import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import partyPopperIcon from '../../assets/onboarding/party-popper.svg';
import graduationCapIcon from '../../assets/onboarding/graduation-cap.svg';
import clockIcon from '../../assets/onboarding/clock.svg';
import { completeOnboarding } from '../../api/onboarding/profile';
import { useUserStore } from '../../store/user/user';

const STEPS = [
  { step: 1, label: '학적 정보' },
  { step: 2, label: '가구 정보 & 관심사' },
  { step: 3, label: '완료' },
];

function FileTextIcon() {
  return (
    <svg
      className="size-12 text-[#747883]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

function MonitorCheckIcon() {
  return (
    <svg
      className="size-12 text-[#747883]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 17v4" />
      <path d="M8 21h8" />
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="m9 10 2 2 4-4" />
    </svg>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex flex-col">
      {STEPS.map((s, idx) => {
        const isActive = s.step === currentStep;
        const isDone = s.step < currentStep;
        const isLast = idx === STEPS.length - 1;
        return (
          <li key={s.step} className="flex items-stretch gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  isActive
                    ? 'border-[#BDB9F9] bg-white'
                    : isDone
                      ? 'border-[#BDB9F9] bg-[#BDB9F9]'
                      : 'border-[#E6E7EB] bg-white'
                }`}
              >
                {isActive && <span className="size-5 rounded-full bg-[#7962ED]" />}
              </span>
              {!isLast && (
                <div className={`w-[2px] flex-1 ${isDone ? 'bg-[#BDB9F9]' : 'bg-[#E6E7EB]'}`} />
              )}
            </div>
            <div className={`flex flex-col ${isLast ? '' : 'pb-10'}`}>
              <span
                className={`text-[12px] font-medium leading-4 ${
                  isActive ? 'text-[#7962ED]' : 'text-[#747883]'
                }`}
              >
                STEP {s.step}
              </span>
              <span
                className={`text-[16px] font-semibold leading-6 ${
                  isActive ? 'text-[#320095]' : 'text-[#555964]'
                }`}
              >
                {s.label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ------------------------------------------------------------------
// 메인 컴포넌트
// ------------------------------------------------------------------
export default function OnboardingComplete() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  // 화면 진입 시 온보딩 완료 처리 API를 자동 호출.
  // 이전 STEP1~3이 모두 저장돼 있어야 정상 동작하는 API임.
  // 성공하면 3초 뒤 큐레이션 화면(/curation)으로 자동 이동.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const finishOnboarding = async () => {
      try {
        const res = await completeOnboarding();
        console.log('온보딩 완료 처리 성공:', res.data.data);

        // 전역 유저 상태에도 온보딩 완료 여부 반영 (다른 화면에서 이 값을 참조하기 때문)
        // NOTE: User 타입에 실제 필드명이 다르면(onboarding, isOnboarded 등) 키만 맞춰 바꾸면 됨
        if (user) {
          setUser({ ...user, onboardingCompleted: res.data.data.onboardingCompleted });
        }

        timer = setTimeout(() => {
          navigate('/curation');
        }, 3000);
      } catch (err) {
        console.error('온보딩 완료 처리 실패:', err);
        setError('맞춤 추천을 준비하는 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.');
      }
    };

    finishOnboarding();

    return () => clearTimeout(timer);
  }, [navigate, user, setUser]);

  return (
    <div className="relative left-1/2 w-screen -ml-[50vw] min-h-screen bg-white text-left font-['Pretendard',sans-serif]">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* 상단바 */}
        <header className="h-20 w-full">
          <div className="flex h-full items-center px-16">
            <img
              src={logo}
              alt="WISHCONNECT"
              className="h-8 cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>
        </header>

        <main className="flex items-start gap-8 px-16 pb-16">
          {/* 좌측 스텝 사이드바 */}
          <aside className="flex h-[896px] w-[237px] shrink-0 flex-col justify-between rounded-2xl bg-[#F9FAFC] p-6">
            <StepIndicator currentStep={3} />
            <div className="flex items-center gap-2">
              <img src={clockIcon} alt="" className="size-[18px] shrink-0" />
              <span className="text-[12px] font-medium leading-4 text-[#747883]">약 1분 소요</span>
            </div>
          </aside>

          {/* 우측 영역 */}
          <section className="flex flex-1 flex-col items-center pt-[38px]">
            {/* 폭죽 아이콘 */}
            <div className="flex size-40 items-center justify-center rounded-full bg-[#F4F4FE]">
              <img src={partyPopperIcon} alt="" className="size-[81px]" />
            </div>

            {/* 완료 텍스트 */}
            <div className="mt-12 flex w-[473px] flex-col items-center gap-2 text-center">
              <h1 className="w-full text-[28px] font-bold leading-10 tracking-[-0.28px] text-[#0A0C11]">
                입력이 완료되었어요!
              </h1>
              <p className="w-full text-[20px] font-medium leading-7 tracking-[-0.1px] text-[#555964]">
                잠시만 기다려 주세요.
              </p>
              <p className="w-full text-[16px] font-medium leading-6 text-[#747883]">
                나에게 맞는 장학금을 찾고 있어요.
                <br />
                맞춤 추천 결과는 다음 화면에서 확인하실 수 있어요.
              </p>
            </div>

            {/* 활용 안내 카드 */}
            <div className="mt-[54px] flex w-full flex-col gap-2 rounded-2xl bg-[#F9FAFC] px-8 py-6">
              <p className="text-[20px] font-bold leading-7 tracking-[-0.1px] text-[#0A0C11]">
                입력한 정보는 이렇게 활용돼요.
              </p>
              <div className="flex h-40 w-full items-center">
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-2">
                  <div className="flex size-20 items-center justify-center rounded-full">
                    <img src={graduationCapIcon} alt="" className="size-12" />
                  </div>
                  <p className="text-center text-[16px] font-medium leading-6 text-[#747883]">
                    지원 자격을 확인해
                    <br />
                    추천 가능한 장학금 선별
                  </p>
                </div>
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 border-x border-[#E6E7EB]">
                  <div className="flex size-20 items-center justify-center rounded-full">
                    <FileTextIcon />
                  </div>
                  <p className="text-center text-[16px] font-medium leading-6 text-[#747883]">
                    나의 조건과 우선순위를 반영해
                    <br />
                    맞춤 장학금 추천
                  </p>
                </div>
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-2">
                  <div className="flex size-20 items-center justify-center rounded-full">
                    <MonitorCheckIcon />
                  </div>
                  <p className="text-center text-[16px] font-medium leading-6 text-[#747883]">
                    놓치기 쉬운 장학금까지
                    <br />
                    폭넓게 큐레이션
                  </p>
                </div>
              </div>
            </div>

            {/* 준비 중 텍스트 / 에러 메시지 — 카드 다음, 맨 아래 */}
            {error ? (
              <p className="mt-[76px] text-[16px] font-medium leading-6 text-[#FA5862]">{error}</p>
            ) : (
              <p className="mt-[76px] text-[16px] font-medium leading-6 text-[#747883]">
                추천 결과를 준비 중이에요...
              </p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
