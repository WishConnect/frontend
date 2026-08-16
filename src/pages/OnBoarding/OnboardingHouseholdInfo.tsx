import { useEffect, useRef, useState, type ReactNode, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import heartIcon from '../../assets/onboarding/heart.svg';
import helpIcon from '../../assets/onboarding/circle-question-mark.svg';
import clockIcon from '../../assets/onboarding/clock.svg';
import { putHouseholdProfile, getMyProfile } from '../../api/onboarding/profile';

function CloseIcon() {
  return (
    <svg
      className="size-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function HelpBubble({
  top,
  left,
  width,
  text,
  connectorSide,
  connectorLength,
}: {
  top: number;
  left: number;
  width: number;
  text: string;
  connectorSide: 'top' | 'bottom';
  connectorLength: number;
}) {
  return (
    <div className="absolute" style={{ top, left, width }}>
      {connectorSide === 'top' && (
        <>
          <div
            className="absolute w-px bg-[#BDB9F9]"
            style={{ left: 60, top: -connectorLength, height: connectorLength }}
          />
          <div
            className="absolute size-2 rounded-full"
            style={{
              left: 60,
              top: -connectorLength,
              backgroundColor: '#7962ED',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </>
      )}
      <div className="rounded-lg bg-white px-6 py-4 text-[16px] font-medium leading-6 text-[#0A0C11] shadow-[0_8px_24px_rgba(16,19,26,0.16)]">
        {text}
      </div>
      {connectorSide === 'bottom' && (
        <>
          <div
            className="absolute w-px bg-[#BDB9F9]"
            style={{ left: 60, bottom: -connectorLength, height: connectorLength }}
          />
          <div
            className="absolute size-2 rounded-full"
            style={{
              left: 60,
              bottom: -connectorLength,
              backgroundColor: '#7962ED',
              transform: 'translate(-50%, 50%)',
            }}
          />
        </>
      )}
    </div>
  );
}

const HELP_BUBBLES = [
  {
    top: 296,
    left: 503,
    width: 307,
    text: '소득 기준 장학금을 추천하는 데 활용돼요.',
    connectorSide: 'bottom' as const,
    connectorLength: 24,
  },
  {
    top: 296,
    left: 1068,
    width: 307,
    text: '일부 장학금은 가구원 수를 함께 확인해요.',
    connectorSide: 'bottom' as const,
    connectorLength: 24,
  },
  {
    top: 461,
    left: 551,
    width: 408,
    text: '한국장학재단에서 소득구간을 확인한 뒤 수정할 수 있어요.',
    connectorSide: 'top' as const,
    connectorLength: 24,
  },
  {
    top: 770,
    left: 924,
    width: 349,
    text: '선택한 조건에 맞는 장학금을 함께 추천해드려요.',
    connectorSide: 'top' as const,
    connectorLength: 24,
  },
];

// ------------------------------------------------------------------
// 지금은 하드코딩된 임의 옵션이지만, 추후 API 응답으로 교체하면 됩니다.
// ------------------------------------------------------------------
const INCOME_LEVEL_OPTIONS: string[] = [
  '1분위',
  '2분위',
  '3분위',
  '4분위',
  '5분위',
  '6분위',
  '7분위',
  '8분위',
  '9분위',
  '10분위',
];

const HOUSEHOLD_SIZE_OPTIONS: string[] = [
  '1인 가구',
  '2인 가구',
  '3인 가구',
  '4인 가구',
  '5인 이상 가구',
];

const HOUSING_TYPE_OPTIONS: string[] = [
  '기초생활수급자',
  '한부모 가정',
  '차상위 계층',
  '다문화 가정',
  '장애인 가정',
  '다자녀 가정',
  '독립유공자 후손',
  '국가유공자',
  '공상 및 순직 군인/경찰/소방/공무원 가정',
  '조손 가정',
  '북한이탈주민',
];

const SELF_STATUS_OPTIONS: string[] = [
  '장애인',
  '자립준비청년',
  '중소기업 제작자',
  '예체능 특기자',
];

const INTEREST_OPTIONS: string[] = [
  '생활비 지원',
  '등록금 지원',
  '해외연수 / 교환학생',
  '학업 / 연구 / 프로젝트',
  '취업 / 진로 지원',
  '대외활동 / 봉사활동',
  '예체능 / 특기 지원',
  '창업지원',
];

const STEPS = [
  { step: 1, label: '학적 정보' },
  { step: 2, label: '가구 정보 & 관심사' },
  { step: 3, label: '완료' },
];

// "소득 분위를 모르겠어요"를 눌렀을 때 API로 보낼 값
// (백엔드 실제 스펙 확인 전까지의 임시 값 — 확인 후 필요하면 수정)
const INCOME_LEVEL_UNKNOWN_VALUE = '모름';

// ------------------------------------------------------------------
// "N인 가구" 라벨에서 숫자만 추출하는 헬퍼 (API는 number를 요구)
// "5인 이상 가구"는 5로 매핑됨
// ------------------------------------------------------------------
function parseHouseholdSize(label: string): number {
  const match = label.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

// parseHouseholdSize의 역방향 — GET 응답의 familySize(number)를
// HOUSEHOLD_SIZE_OPTIONS 라벨로 되돌린다. 5 이상은 전부 "5인 이상 가구"로 매핑.
function familySizeToLabel(size: number | null | undefined): string {
  if (!size || size <= 0) return '';
  if (size >= 5) return '5인 이상 가구';
  return `${size}인 가구`;
}

// ------------------------------------------------------------------
// 선택된 배열 + 직접입력 값을 하나의 배열로 합치는 헬퍼
// ------------------------------------------------------------------
function mergeWithCustom(list: string[], custom: string): string[] {
  const trimmed = custom.trim();
  return trimmed ? [...list, trimmed] : list;
}

// mergeWithCustom의 역방향 — GET 응답 배열을 "정해진 옵션에 있는 값"과
// "그 외 직접입력 값"으로 분리한다. 직접입력은 한 개만 지원하는 UI라
// 옵션에 없는 값이 여러 개면 첫 번째만 커스텀 입력창에 채운다.
function splitKnownAndCustom(
  values: string[] | null | undefined,
  knownOptions: string[],
): { known: string[]; custom: string } {
  if (!values) return { known: [], custom: '' };
  const known = values.filter((v) => knownOptions.includes(v));
  const custom = values.find((v) => !knownOptions.includes(v)) ?? '';
  return { known, custom };
}

// ------------------------------------------------------------------
// 아이콘
// ------------------------------------------------------------------
function ChevronDownIcon() {
  return (
    <svg
      className="pointer-events-none size-6 shrink-0 text-[#9DA1AC]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      className="size-6 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="size-6 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="size-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ------------------------------------------------------------------
// 공통 컴포넌트 (STEP1과 동일한 톤)
// ------------------------------------------------------------------
function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <div className="flex items-start gap-1">
      <span className="text-[16px] font-semibold leading-6 text-[#0A0C11]">{children}</span>
      {required && <span className="text-[16px] font-medium leading-6 text-[#FA5862]">*</span>}
    </div>
  );
}

// ------------------------------------------------------------------
// SelectField: wrapper(화살표 포함) 클릭 시에도 select가 열리도록
// showPicker()를 시도하고, 미지원 브라우저는 focus()로 폴백.
// (참고) `if ('showPicker' in el)` 형태의 in-내로잉은 catch 블록에서
// el 타입을 `never`로 좁혀버리는 TS 버그성 동작이 있어, 대신
// `typeof el.showPicker === 'function'`으로 체크한다.
// ------------------------------------------------------------------
function SelectField({
  value,
  onChange,
  placeholder,
  options,
  disabled,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  options: string[];
  disabled?: boolean;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);

  const openPicker = () => {
    if (disabled) return;
    const el = selectRef.current;
    if (!el) return;

    const elWithPicker = el as HTMLSelectElement & { showPicker?: () => void };

    try {
      if (typeof elWithPicker.showPicker === 'function') {
        elWithPicker.showPicker();
      } else {
        el.focus();
      }
    } catch {
      el.focus();
    }
  };

  return (
    <div
      onClick={openPicker}
      className={`flex w-full flex-1 items-center gap-6 rounded-lg bg-[#F9FAFC] py-3 pl-6 pr-3 ${
        disabled ? 'opacity-50' : 'cursor-pointer'
      }`}
    >
      <select
        ref={selectRef}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full flex-1 appearance-none bg-transparent text-[16px] font-medium leading-6 focus:outline-none ${
          value ? 'text-[#0A0C11]' : 'text-[#9DA1AC]'
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-[#0A0C11]">
            {opt}
          </option>
        ))}
      </select>
      <ChevronDownIcon />
    </div>
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
// 체크박스 칩 (가정 형태 / 본인 해당 항목 / 관심분야 공용)
// ------------------------------------------------------------------
function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        backgroundColor: '#FFFFFF',
        border: `1px solid ${selected ? '#7962ED' : '#E6E7EB'}`,
      }}
      className="flex items-center gap-3 rounded-lg py-3 pl-3 pr-6 text-[16px] font-medium leading-6 text-[#0A0C11] transition-colors"
    >
      <span
        style={{
          backgroundColor: selected ? '#7962ED' : '#FFFFFF',
          border: `1px solid ${selected ? '#7962ED' : '#E6E7EB'}`,
        }}
        className="flex size-5 shrink-0 items-center justify-center rounded"
      >
        {selected && <CheckIcon />}
      </span>
      {label}
    </button>
  );
}

function CustomInputChip({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const filled = value.trim().length > 0;
  return (
    <div
      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${filled ? '#7962ED' : '#E6E7EB'}` }}
      className="flex items-center gap-3 rounded-lg py-2 pl-3 pr-2"
    >
      <span
        style={{
          backgroundColor: filled ? '#7962ED' : '#FFFFFF',
          border: `1px solid ${filled ? '#7962ED' : '#E6E7EB'}`,
        }}
        className="flex size-5 shrink-0 items-center justify-center rounded"
      >
        {filled && <CheckIcon />}
      </span>
      <div className="flex items-center rounded bg-[#F3F4F6] px-3 py-1">
        <input
          value={value}
          onChange={onChange}
          placeholder="직접 입력"
          className="w-[161px] bg-transparent text-[16px] font-medium leading-6 text-[#0A0C11] placeholder:text-[#9DA1AC] focus:outline-none"
        />
      </div>
    </div>
  );
}

function MultiSelectSection({
  title,
  options,
  selected,
  onToggle,
  onToggleAll,
  showCustomInput,
  customValue,
  onCustomChange,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (opt: string) => void;
  onToggleAll: () => void;
  showCustomInput?: boolean;
  customValue?: string;
  onCustomChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const allSelected = options.every((opt) => selected.includes(opt));
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center gap-8">
        <div className="flex flex-1 items-center gap-2">
          <span className="text-[16px] font-semibold leading-6 text-[#0A0C11]">{title}</span>
          <span className="text-[16px] font-medium leading-6 text-[#747883]">(모두 선택)</span>
        </div>
        <button type="button" onClick={onToggleAll} className="flex shrink-0 items-center gap-2">
          <span
            style={{
              backgroundColor: allSelected ? '#7962ED' : '#FFFFFF',
              border: `1px solid ${allSelected ? '#7962ED' : '#E6E7EB'}`,
            }}
            className="flex size-5 items-center justify-center rounded"
          >
            {allSelected && <CheckIcon />}
          </span>
          <span className="text-[12px] font-medium leading-4 text-[#747883]">전체 선택</span>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Chip
            key={opt}
            label={opt}
            selected={selected.includes(opt)}
            onClick={() => onToggle(opt)}
          />
        ))}
      </div>
      {showCustomInput && (
        <div className="flex w-full">
          <CustomInputChip value={customValue ?? ''} onChange={onCustomChange!} />
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// 메인 컴포넌트
// ------------------------------------------------------------------
export default function OnboardingHouseholdInfo() {
  const navigate = useNavigate();
  const [incomeLevel, setIncomeLevel] = useState('');
  const [incomeUnknown, setIncomeUnknown] = useState(false);
  const [householdSize, setHouseholdSize] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 기존 등록 정보 불러오기 (온보딩 재진입 / 추천 기준 수정하기 진입 시 prefill)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [housingTypes, setHousingTypes] = useState<string[]>([]);
  const [selfStatuses, setSelfStatuses] = useState<string[]>([]);
  const [selfStatusCustom, setSelfStatusCustom] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestCustom, setInterestCustom] = useState('');

  // GET /users/me/profile 의 household(+ 최상위 interests)로 폼을 채움.
  // 처음 온보딩하는 유저는 household가 없을 수 있으므로 그 경우엔 빈 폼 그대로 둔다.
  useEffect(() => {
    const fetchExistingProfile = async () => {
      try {
        const res = await getMyProfile();
        const profile = res.data.data;
        const household = profile.household;

        if (household) {
          const isUnknown =
            !household.incomeLevel || household.incomeLevel === INCOME_LEVEL_UNKNOWN_VALUE;
          setIncomeUnknown(isUnknown);
          setIncomeLevel(isUnknown ? '' : (household.incomeLevel ?? ''));
          setHouseholdSize(familySizeToLabel(household.familySize));
          setHousingTypes(household.familyTypes ?? []);

          const { known: knownStatuses, custom: customStatus } = splitKnownAndCustom(
            household.personalStatuses,
            SELF_STATUS_OPTIONS,
          );
          setSelfStatuses(knownStatuses);
          setSelfStatusCustom(customStatus);
        }

        // interests는 household와 별개로 프로필 최상위에 옴
        const { known: knownInterests, custom: customInterest } = splitKnownAndCustom(
          profile.interests,
          INTEREST_OPTIONS,
        );
        setInterests(knownInterests);
        setInterestCustom(customInterest);
      } catch (err) {
        // 기존 정보 로드 실패는 신규 온보딩과 동일하게 빈 폼으로 진행하면 되므로
        // 에러 배너 없이 콘솔 로그만 남긴다.
        console.error('기존 가구 정보 조회 실패:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchExistingProfile();
  }, []);

  const toggleInList = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const toggleAllInList = (options: string[], list: string[], setList: (v: string[]) => void) => {
    const allSelected = options.every((opt) => list.includes(opt));
    setList(allSelected ? [] : [...options]);
  };

  const handleToggleIncomeUnknown = () => {
    setIncomeUnknown((v) => !v);
    // "모르겠어요"를 켜면 직접 선택한 소득 분위는 초기화
    if (!incomeUnknown) {
      setIncomeLevel('');
    }
  };

  const handlePrev = () => {
    navigate('/onboarding');
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await putHouseholdProfile({
        incomeLevel: incomeUnknown ? INCOME_LEVEL_UNKNOWN_VALUE : incomeLevel,
        familySize: parseHouseholdSize(householdSize),
        familyTypes: housingTypes,
        personalStatuses: mergeWithCustom(selfStatuses, selfStatusCustom),
        interests: mergeWithCustom(interests, interestCustom),
      });

      console.log('가구 정보 & 관심사 저장 성공:', res.data.data);
      navigate('/onboarding/complete');
    } catch (err) {
      console.error('가구 정보 & 관심사 저장 실패:', err);
      setSubmitError('저장에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative left-1/2 w-screen -ml-[50vw] min-h-screen bg-white text-left font-['Pretendard',sans-serif]">
      <div className="relative mx-auto w-full max-w-[1440px]">
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
            <StepIndicator currentStep={2} />
            <div className="flex items-center gap-2">
              <img src={clockIcon} alt="" className="size-[18px] shrink-0" />
              <span className="text-[12px] font-medium leading-4 text-[#747883]">약 1분 소요</span>
            </div>
          </aside>

          {/* 우측 폼 영역 */}
          <section className={`flex flex-1 flex-col ${isLoadingProfile ? 'opacity-60' : ''}`}>
            {/* 아이콘 + 도움말 */}
            <div className="flex w-full items-start justify-between">
              <div className="flex size-20 items-center justify-center rounded-full bg-[#F9FAFC]">
                <img src={heartIcon} alt="" className="size-[42px]" />
              </div>
              <button
                type="button"
                onClick={() => setShowHelp((v) => !v)}
                style={
                  showHelp
                    ? { backgroundColor: '#FFFFFF', border: '1px solid #E6E7EB' }
                    : { backgroundColor: '#F3F4F6', border: '1px solid transparent' }
                }
                className="relative z-30 flex items-center gap-2 rounded-lg px-6 py-3 text-[12px] font-medium leading-4 text-[#747883]"
              >
                {showHelp ? (
                  <>
                    <CloseIcon />
                    도움말 닫기
                  </>
                ) : (
                  <>
                    <img src={helpIcon} alt="" className="size-[18px] shrink-0" />
                    도움말
                  </>
                )}
              </button>
            </div>

            {/* 타이틀 */}
            <div className="mt-4 flex flex-col gap-2">
              <h1 className="text-[28px] font-bold leading-10 tracking-[-0.28px] text-[#0A0C11]">
                해당되는 조건과 관심 분야를 선택해 주세요
              </h1>
              <p className="text-[16px] font-medium leading-6 text-[#747883]">
                입력한 정보는 장학금 필터링과 맞춤 추천에 활용돼요.
              </p>
            </div>

            {/* 본문 */}
            <div className="mt-9 flex w-full flex-col gap-16">
              {/* 가구 정보 */}
              <div className="flex w-full flex-col gap-4">
                <h2 className="text-[20px] font-bold leading-7 tracking-[-0.1px] text-[#0A0C11]">
                  가구 정보
                </h2>
                <div className="flex w-full flex-col gap-12">
                  {/* 소득 분위 / 가구원 수 */}
                  <div className="flex w-full items-start gap-8">
                    <div className="flex flex-1 flex-col gap-2">
                      <FieldLabel>소득 분위</FieldLabel>
                      <div className="flex w-full items-center gap-2">
                        <SelectField
                          value={incomeLevel}
                          onChange={(e) => setIncomeLevel(e.target.value)}
                          placeholder="선택해 주세요"
                          options={INCOME_LEVEL_OPTIONS}
                          disabled={incomeUnknown}
                        />
                        <button
                          type="button"
                          onClick={handleToggleIncomeUnknown}
                          aria-pressed={incomeUnknown}
                          style={{
                            backgroundColor: '#F9FAFC',
                            border: `1px solid ${incomeUnknown ? '#7962ED' : '#E6E7EB'}`,
                            color: incomeUnknown ? '#7962ED' : '#747883',
                          }}
                          className="flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-6 py-3 text-[16px] font-medium leading-6 transition-colors"
                        >
                          모르겠어요
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <FieldLabel>가구원 수</FieldLabel>
                      <SelectField
                        value={householdSize}
                        onChange={(e) => setHouseholdSize(e.target.value)}
                        placeholder="선택해 주세요"
                        options={HOUSEHOLD_SIZE_OPTIONS}
                      />
                    </div>
                  </div>

                  {/* 가정 형태 */}
                  <MultiSelectSection
                    title="가정 형태"
                    options={HOUSING_TYPE_OPTIONS}
                    selected={housingTypes}
                    onToggle={(opt) => toggleInList(housingTypes, setHousingTypes, opt)}
                    onToggleAll={() =>
                      toggleAllInList(HOUSING_TYPE_OPTIONS, housingTypes, setHousingTypes)
                    }
                  />

                  {/* 본인에게 해당되는 항목 */}
                  <MultiSelectSection
                    title="본인에게 해당되는 항목"
                    options={SELF_STATUS_OPTIONS}
                    selected={selfStatuses}
                    onToggle={(opt) => toggleInList(selfStatuses, setSelfStatuses, opt)}
                    onToggleAll={() =>
                      toggleAllInList(SELF_STATUS_OPTIONS, selfStatuses, setSelfStatuses)
                    }
                    showCustomInput
                    customValue={selfStatusCustom}
                    onCustomChange={(e) => setSelfStatusCustom(e.target.value)}
                  />
                </div>
              </div>

              {/* 어떤 장학금에 관심이 있으신가요? */}
              <div className="flex w-full flex-col gap-4">
                <FieldLabel required>
                  <span className="text-[20px] font-bold leading-7 tracking-[-0.1px]">
                    어떤 장학금에 관심이 있으신가요?
                  </span>
                </FieldLabel>
                <MultiSelectSection
                  title="관심분야"
                  options={INTEREST_OPTIONS}
                  selected={interests}
                  onToggle={(opt) => toggleInList(interests, setInterests, opt)}
                  onToggleAll={() => toggleAllInList(INTEREST_OPTIONS, interests, setInterests)}
                  showCustomInput
                  customValue={interestCustom}
                  onCustomChange={(e) => setInterestCustom(e.target.value)}
                />
              </div>
            </div>

            {/* 제출 에러 메시지 */}
            {submitError && (
              <p className="mt-6 text-right text-[14px] font-medium leading-5 text-[#FA5862]">
                {submitError}
              </p>
            )}

            {/* 하단 버튼 */}
            <div className="mt-16 flex w-full items-center justify-end gap-4">
              <button
                type="button"
                onClick={handlePrev}
                style={{ backgroundColor: '#F3F4F6', border: '1px solid transparent' }}
                className="flex items-center gap-4 rounded-lg py-4 pl-4 pr-8 text-[20px] font-medium leading-7 tracking-[-0.1px] text-[#747883]"
              >
                <ChevronLeftIcon />
                이전
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                style={{
                  backgroundImage:
                    'linear-gradient(115.029deg, rgb(121, 98, 237) 30.662%, rgb(189, 185, 249) 105.21%)',
                  opacity: isSubmitting ? 0.6 : 1,
                }}
                className="flex items-center gap-4 rounded-lg py-4 pl-8 pr-4 text-[20px] font-medium leading-7 tracking-[-0.1px] text-white"
              >
                {isSubmitting ? '저장 중...' : '다음 단계로'}
                <ChevronRightIcon />
              </button>
            </div>
          </section>
        </main>

        {/* 도움말 배경 딤 처리 */}
        {showHelp && (
          <div
            className="absolute inset-0 z-10 bg-[#10131A]/60"
            onClick={() => setShowHelp(false)}
          />
        )}

        {/* 도움말 오버레이 */}
        {showHelp && (
          <div className="pointer-events-none absolute inset-0 z-20">
            {HELP_BUBBLES.map((bubble) => (
              <HelpBubble key={bubble.text} {...bubble} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
