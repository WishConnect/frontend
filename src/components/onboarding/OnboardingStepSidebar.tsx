import clockIcon from '../../assets/onboarding/clock.svg';

/** 온보딩 단계 식별자. 번호가 아니라 id 로 받는 이유는 아래 STEPS 주석 참고. */
export type OnboardingStepId = 'basic' | 'academic' | 'household' | 'complete';

// 온보딩 단계 정의.
//
// 소셜 로그인은 가입 때 이름·생년월일·연락처·성별·국적·거주지역을 받지 못해서 "기본 정보"를
// 한 단계 더 거친다(4단계). 일반 회원가입은 그 값들을 이미 받았으므로 기본 정보 없이 3단계다.
//
// 그래서 같은 "학적 정보"가 일반에선 STEP 1, 소셜에선 STEP 2 가 된다. 화면마다 번호를 계산해
// 넘기면 흐름이 바뀔 때마다 네 곳을 같이 고쳐야 하므로, 번호는 여기서만 매기고 화면은 id 만 준다.
const BASIC_STEP = { id: 'basic' as const, label: '기본 정보' };
const COMMON_STEPS = [
  { id: 'academic' as const, label: '학적 정보' },
  { id: 'household' as const, label: '가구 정보 & 관심사' },
  { id: 'complete' as const, label: '완료' },
];

interface OnboardingStepSidebarProps {
  /** 지금 보고 있는 단계 */
  current: OnboardingStepId;
  /** 소셜 로그인 온보딩이면 true — 맨 앞에 "기본 정보" 단계가 붙는다 */
  includeBasicStep?: boolean;
}

/**
 * 온보딩 전용 좌측 스텝 사이드바.
 * 원래 각 온보딩 페이지에 동일한 코드가 3벌 중복돼 있던 것을 공통 컴포넌트로 분리했다.
 * 전역 LeftSidebar(추천 장학금/보관함/…)와 달리, 온보딩 진행 단계만 보여준다.
 */
export default function OnboardingStepSidebar({
  current,
  includeBasicStep = false,
}: OnboardingStepSidebarProps) {
  const steps = includeBasicStep ? [BASIC_STEP, ...COMMON_STEPS] : COMMON_STEPS;
  const currentIndex = steps.findIndex((s) => s.id === current);

  return (
    <aside className="mr-8 flex h-[896px] w-[237px] shrink-0 flex-col justify-between rounded-2xl bg-[#F9FAFC] p-6">
      {/* 단계 목록 */}
      <ol className="flex flex-col">
        {steps.map((s, idx) => {
          const isActive = idx === currentIndex; // 현재 단계
          const isDone = currentIndex >= 0 && idx < currentIndex; // 이미 지나온 단계
          const isLast = idx === steps.length - 1;
          return (
            <li key={s.id} className="flex items-stretch gap-4">
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
                  STEP {idx + 1}
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
