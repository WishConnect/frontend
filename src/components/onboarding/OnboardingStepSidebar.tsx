import clockIcon from '../../assets/onboarding/clock.svg';

// 온보딩 3단계 정의 (학적 정보 → 가구 정보 & 관심사 → 완료)
const STEPS = [
  { step: 1, label: '학적 정보' },
  { step: 2, label: '가구 정보 & 관심사' },
  { step: 3, label: '완료' },
];

interface OnboardingStepSidebarProps {
  /** 현재 진행 중인 단계 (1~3) */
  currentStep: number;
}

/**
 * 온보딩 전용 좌측 스텝 사이드바.
 * 원래 각 온보딩 페이지에 동일한 코드가 3벌 중복돼 있던 것을 공통 컴포넌트로 분리했다.
 * 전역 LeftSidebar(추천 장학금/보관함/…)와 달리, 온보딩 진행 단계만 보여준다.
 */
export default function OnboardingStepSidebar({ currentStep }: OnboardingStepSidebarProps) {
  return (
    <aside className="mr-8 flex h-[896px] w-[237px] shrink-0 flex-col justify-between rounded-2xl bg-[#F9FAFC] p-6">
      {/* 단계 목록 */}
      <ol className="flex flex-col">
        {STEPS.map((s, idx) => {
          const isActive = s.step === currentStep; // 현재 단계
          const isDone = s.step < currentStep; // 이미 지나온 단계
          const isLast = idx === STEPS.length - 1;
          return (
            <li key={s.step} className="flex items-stretch gap-4">
              {/* 좌측 동그라미 + 연결선 */}
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
              {/* 우측 라벨 (STEP n / 단계명) */}
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

      {/* 하단 소요 시간 안내 */}
      <div className="flex items-center gap-2">
        <img src={clockIcon} alt="" className="size-[18px] shrink-0" />
        <span className="text-[12px] font-medium leading-4 text-[#747883]">약 1분 소요</span>
      </div>
    </aside>
  );
}
