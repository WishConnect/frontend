import { useState, type ReactNode, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import capIcon from '../../assets/onboarding/graduation-cap.svg';
import helpIcon from '../../assets/onboarding/circle-question-mark.svg';
import searchIcon from '../../assets/onboarding/magnifyingglass.svg';
import clockIcon from '../../assets/onboarding/clock.svg';

// 피그마(node-id 382-387) get_design_context 기준 실제 토큰
// Text Colors/H1: #0A0C11 · H2: #555964 · H3: #747883 · Disabled: #9DA1AC
// Sub Colors/accent_red: #FA5862 · Primary/purple: #7962ED · purple_deep: #320095
// Gray/50: #F9FAFC · Gray/100: #F3F4F6 · Gray/200: #E6E7EB

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

// 도움말 모드에서 특정 필드를 가리키는 말풍선.
// top/left/width 값은 피그마 절대좌표(1440px 기준) 그대로 사용 — 페이지 레이아웃이
// 같은 좌표계를 따르도록 맞춰뒀기 때문에 그대로 넣으면 필드 위치에 맞게 배치돼요.
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

// 피그마(node-id 1428-6143) get_design_context 기준 도움말 말풍선 데이터
const HELP_BUBBLES = [
  {
    top: 530,
    left: 413,
    width: 384,
    text: '재학생, 휴학생 등 지원 가능한 장학금을 구분해드려요.',
    connectorSide: 'bottom' as const,
    connectorLength: 46,
  },
  {
    top: 506,
    left: 1022,
    width: 353,
    text: '성적 기준이 있는 장학금을 추천하는 데 활용돼요. (정확히 입력할수록 추천 정확도가 높아져요.)',
    connectorSide: 'bottom' as const,
    connectorLength: 46,
  },
  {
    top: 692,
    left: 602,
    width: 339,
    text: '학년 제한이 있는 장학금을 추천할 때 활용돼요.',
    connectorSide: 'top' as const,
    connectorLength: 12,
  },
  {
    top: 832,
    left: 413,
    width: 349,
    text: '다양한 전공을 활용한 장학금도 함께 찾아드려요.',
    connectorSide: 'top' as const,
    connectorLength: 24,
  },
];

// ------------------------------------------------------------------
// 지금은 하드코딩된 임의 옵션이지만, 추후 학교/학과 API 응답으로 교체하면 됩니다.
// ------------------------------------------------------------------
const MAJOR_CATEGORY_OPTIONS: string[] = [
  '인문계열',
  '사회계열',
  '자연계열',
  '공학계열',
  '의약계열',
  '예체능계열',
  '교육계열',
];

const ENROLLMENT_STATUS_OPTIONS: string[] = ['재학', '휴학', '졸업예정', '졸업'];

const GRADE_SEMESTER_OPTIONS: string[] = [
  '1학년 1학기',
  '1학년 2학기',
  '2학년 1학기',
  '2학년 2학기',
  '3학년 1학기',
  '3학년 2학기',
  '4학년 1학기',
  '4학년 2학기',
  '5학년 이상',
];

interface AcademicForm {
  school: string;
  majorCategory: string;
  majorName: string;
  enrollmentStatus: string;
  gradeSemester: string;
  lastSemesterGpa: string;
  cumulativeGpa: string;
}

const DEFAULT_FORM: AcademicForm = {
  school: '',
  majorCategory: '',
  majorName: '',
  enrollmentStatus: '',
  gradeSemester: '',
  lastSemesterGpa: '',
  cumulativeGpa: '',
};

const STEPS = [
  { step: 1, label: '학적 정보' },
  { step: 2, label: '가구 정보 & 관심사' },
  { step: 3, label: '완료' },
];

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

// ------------------------------------------------------------------
// 공통 컴포넌트
// ------------------------------------------------------------------
function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <div className="flex items-start gap-1">
      <span className="text-[16px] font-semibold leading-6 text-[#0A0C11]">{children}</span>
      {required && <span className="text-[16px] font-medium leading-6 text-[#FA5862]">*</span>}
    </div>
  );
}

function TextField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <div className="flex w-full items-center rounded-lg bg-[#F9FAFC] px-6 py-3">
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full flex-1 bg-transparent text-[16px] font-medium leading-6 text-[#0A0C11] placeholder:text-[#9DA1AC] focus:outline-none"
      />
    </div>
  );
}

function SelectField({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="flex w-full items-center gap-6 rounded-lg bg-[#F9FAFC] py-3 pl-6 pr-3">
      <select
        value={value}
        onChange={onChange}
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
// 메인 컴포넌트
// ------------------------------------------------------------------
export default function OnboardingAcademicInfo() {
  const navigate = useNavigate();
  const [form, setForm] = useState<AcademicForm>(DEFAULT_FORM);
  const [doubleMajor, setDoubleMajor] = useState(false);
  const [minorMajor, setMinorMajor] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const updateField =
    (field: keyof AcademicForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handlePrev = () => {
    // 진입 페이지라 이전 단계가 없음 — 필요 시 홈 등으로 변경
    navigate(-1);
  };

  const handleNext = () => {
    // TODO: 폼 유효성 검사
    console.log('학적 정보:', form, { doubleMajor, minorMajor });
    navigate('/onboarding/household');
  };

  return (
    <div className="relative left-1/2 w-screen -ml-[50vw] min-h-screen bg-white text-left font-['Pretendard',sans-serif]">
      <div className="relative mx-auto w-full max-w-[1440px]">
        {/* 상단바 */}
        <header className="h-20 w-full">
          <div className="flex h-full items-center px-16">
            <img src={logo} alt="WISHCONNECT" className="h-8" />
          </div>
        </header>

        <main className="flex items-start gap-8 px-16 pb-16">
          {/* 좌측 스텝 사이드바 */}
          <aside className="flex h-[896px] w-[237px] shrink-0 flex-col justify-between rounded-2xl bg-[#F9FAFC] p-6">
            <StepIndicator currentStep={1} />
            <div className="flex items-center gap-2">
              <img src={clockIcon} alt="" className="size-[18px] shrink-0" />
              <span className="text-[12px] font-medium leading-4 text-[#747883]">약 1분 소요</span>
            </div>
          </aside>

          {/* 우측 폼 영역 */}
          <section className="flex flex-1 flex-col">
            {/* 아이콘 + 도움말 */}
            <div className="flex w-full items-start justify-between">
              <div className="flex size-20 items-center justify-center rounded-full bg-[#F9FAFC]">
                <img src={capIcon} alt="" className="size-12" />
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
                학적 정보를 입력해 주세요.
              </h1>
              <p className="text-[16px] font-medium leading-6 text-[#747883]">
                현재 학업 상황을 바탕으로 지원 가능한 장학금을 더 정확하게 추천해 드려요.
              </p>
            </div>

            {/* 폼 필드 */}
            <div className="mt-20 flex w-full flex-col gap-12">
              {/* 소속 학교 */}
              <div className="flex flex-col gap-2">
                <FieldLabel required>소속 학교</FieldLabel>
                <div className="flex w-full items-center gap-3 rounded-lg bg-[#F9FAFC] py-3 pl-6 pr-3">
                  <input
                    value={form.school}
                    onChange={updateField('school')}
                    placeholder="학교명을 입력해 주세요"
                    className="w-full flex-1 bg-transparent text-[16px] font-medium leading-6 text-[#0A0C11] placeholder:text-[#9DA1AC] focus:outline-none"
                  />
                  <img src={searchIcon} alt="" className="size-[22px] shrink-0" />
                </div>
              </div>

              {/* 전공 분류 / 전공명 */}
              <div className="flex w-full items-start gap-8">
                <div className="flex flex-1 flex-col gap-2">
                  <FieldLabel required>전공 분류</FieldLabel>
                  <SelectField
                    value={form.majorCategory}
                    onChange={updateField('majorCategory')}
                    placeholder="선택해 주세요"
                    options={MAJOR_CATEGORY_OPTIONS}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <FieldLabel required>전공명</FieldLabel>
                  <TextField
                    value={form.majorName}
                    onChange={updateField('majorName')}
                    placeholder="전공명을 입력해 주세요"
                  />
                </div>
              </div>

              {/* 재학 상태 / 학년-학기 / 직전학기 학점 / 누적 학점 */}
              <div className="flex w-full items-start gap-8">
                <div className="flex flex-1 flex-col gap-2">
                  <FieldLabel required>재학 상태</FieldLabel>
                  <SelectField
                    value={form.enrollmentStatus}
                    onChange={updateField('enrollmentStatus')}
                    placeholder="선택해 주세요"
                    options={ENROLLMENT_STATUS_OPTIONS}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <FieldLabel required>학년/학기</FieldLabel>
                  <SelectField
                    value={form.gradeSemester}
                    onChange={updateField('gradeSemester')}
                    placeholder="선택해 주세요"
                    options={GRADE_SEMESTER_OPTIONS}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <FieldLabel required>
                    직전학기 학점{' '}
                    <span className="font-semibold text-[#0A0C11]">(4.5 만점 기준)</span>
                  </FieldLabel>
                  <TextField
                    value={form.lastSemesterGpa}
                    onChange={updateField('lastSemesterGpa')}
                    placeholder="학점을 입력해 주세요"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <FieldLabel required>
                    누적 학점 <span className="font-semibold text-[#0A0C11]">(4.5 만점 기준)</span>
                  </FieldLabel>
                  <TextField
                    value={form.cumulativeGpa}
                    onChange={updateField('cumulativeGpa')}
                    placeholder="학점을 입력해 주세요"
                  />
                </div>
              </div>

              {/* 복수전공 / 부전공 여부 — 피그마상 왼쪽 절반(505px)만 차지, 오른쪽은 비워둠 */}
              <div className="flex w-full items-start gap-8">
                <div className="flex flex-1 flex-col gap-2">
                  <FieldLabel>복수전공/부전공 여부</FieldLabel>
                  <div className="flex w-full items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDoubleMajor((v) => !v)}
                      aria-pressed={doubleMajor}
                      style={
                        doubleMajor
                          ? {
                              backgroundColor: '#7962ED',
                              border: '1px solid #7962ED',
                              color: '#FFFFFF',
                            }
                          : {
                              backgroundColor: '#F9FAFC',
                              border: '1px solid #E6E7EB',
                              color: '#0A0C11',
                            }
                      }
                      className="flex flex-1 items-center justify-center rounded-lg px-6 py-3 text-center text-[16px] font-medium leading-6 transition-colors"
                    >
                      복수전공
                    </button>
                    <button
                      type="button"
                      onClick={() => setMinorMajor((v) => !v)}
                      aria-pressed={minorMajor}
                      style={
                        minorMajor
                          ? {
                              backgroundColor: '#7962ED',
                              border: '1px solid #7962ED',
                              color: '#FFFFFF',
                            }
                          : {
                              backgroundColor: '#F9FAFC',
                              border: '1px solid #E6E7EB',
                              color: '#0A0C11',
                            }
                      }
                      className="flex flex-1 items-center justify-center rounded-lg px-6 py-3 text-center text-[16px] font-medium leading-6 transition-colors"
                    >
                      부전공
                    </button>
                  </div>
                </div>
                <div className="flex-1" />
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="mt-24 flex w-full items-center justify-end gap-4">
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
                style={{
                  backgroundImage:
                    'linear-gradient(115.029deg, rgb(121, 98, 237) 30.662%, rgb(189, 185, 249) 105.21%)',
                }}
                className="flex items-center gap-4 rounded-lg py-4 pl-8 pr-4 text-[20px] font-medium leading-7 tracking-[-0.1px] text-white"
              >
                다음 단계로
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
