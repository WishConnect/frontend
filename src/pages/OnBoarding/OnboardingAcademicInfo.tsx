import { useState, useEffect, type ReactNode, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import logo from '../../assets/logo.svg';
import capIcon from '../../assets/onboarding/graduation-cap.svg';
import helpIcon from '../../assets/onboarding/circle-question-mark.svg';
import searchIcon from '../../assets/onboarding/magnifyingglass.svg';
import clockIcon from '../../assets/onboarding/clock.svg';
import { putAcademicProfile, searchUniversities, searchMajors } from '../../api/onboarding/profile';
import type { University, Major } from '../../types/onboarding/profile';

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
// 전공 분류 목록을 조회하는 API가 명세서에 없어 하드코딩 유지.
// (전공 "명" 검색 API(/majors/search)는 있지만, 계열 목록 자체를 주는
//  API가 아니라서 이 셀렉트 옵션과는 별개로 둠. 디자인 유지를 위해
//  전공 분류/전공명 필드는 계속 분리된 상태로 둠)
// ------------------------------------------------------------------
const MAJOR_CATEGORY_OPTIONS: string[] = [
  '인문사회계열',
  '공학계열',
  '자연과학계열',
  '예체능계열',
  '의학계열',
  '광역계열',
];

const ENROLLMENT_STATUS_OPTIONS: string[] = ['재학', '휴학', '졸업'];

const ENROLLMENT_STATUS_MAP: Record<string, string> = {
  재학: 'ENROLLED',
  휴학: 'ON_LEAVE',
  졸업: 'GRADUATED',
};

function getDualMajorValue(doubleMajor: boolean, minorMajor: boolean): string {
  if (doubleMajor) return 'DOUBLE';
  if (minorMajor) return 'MINOR';
  return '';
}

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
// 검색 드롭다운 공통 컴포넌트 (학교/전공 공용)
// ------------------------------------------------------------------
function SearchDropdown<T extends { id: number; name: string }>({
  items,
  onSelect,
  renderSubtext,
}: {
  items: T[];
  onSelect: (item: T) => void;
  renderSubtext: (item: T) => string;
}) {
  return (
    <ul className="absolute top-full z-40 mt-2 max-h-60 w-full overflow-y-auto rounded-lg bg-white shadow-[0_8px_24px_rgba(16,19,26,0.16)]">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="flex w-full flex-col items-start px-6 py-3 text-left hover:bg-[#F9FAFC]"
          >
            <span className="text-[16px] font-medium text-[#0A0C11]">{item.name}</span>
            <span className="text-[12px] text-[#9DA1AC]">{renderSubtext(item)}</span>
          </button>
        </li>
      ))}
    </ul>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 학교 검색 자동완성
  const [universityResults, setUniversityResults] = useState<University[]>([]);
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);

  // 전공명 검색 자동완성
  const [majorResults, setMajorResults] = useState<Major[]>([]);
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);

  const updateField =
    (field: keyof AcademicForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // 학교명 입력 → 0.3초 디바운스 후 검색
  useEffect(() => {
    const keyword = form.school.trim();
    if (!keyword) {
      setUniversityResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await searchUniversities(keyword);
        setUniversityResults(res.data.data);
        setShowUniversityDropdown(true);
      } catch (err) {
        console.error('학교 검색 실패:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [form.school]);

  // 전공명 입력 → 0.3초 디바운스 후 검색
  useEffect(() => {
    const keyword = form.majorName.trim();
    if (!keyword) {
      setMajorResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await searchMajors(keyword);
        setMajorResults(res.data.data);
        setShowMajorDropdown(true);
      } catch (err) {
        console.error('전공 검색 실패:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [form.majorName]);

  const handleSelectUniversity = (uni: University) => {
    setForm((prev) => ({ ...prev, school: uni.name }));
    setShowUniversityDropdown(false);
    setUniversityResults([]);
  };

  // 디자인상 "전공 분류"는 별도 셀렉트로 유지 — 검색 결과 선택 시 majorName만 채움
  const handleSelectMajor = (major: Major) => {
    setForm((prev) => ({ ...prev, majorName: major.name }));
    setShowMajorDropdown(false);
    setMajorResults([]);
  };

  const handlePrev = () => {
    // 진입 페이지라 이전 단계가 없음 — 필요 시 홈 등으로 변경
    navigate(-1);
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await putAcademicProfile({
        university: form.school,
        majorCategory: form.majorCategory,
        majorName: form.majorName,
        enrollmentStatus: ENROLLMENT_STATUS_MAP[form.enrollmentStatus],
        grade: form.gradeSemester,
        semesterGpa: Number(form.lastSemesterGpa),
        cumulativeGpa: Number(form.cumulativeGpa),
        dualMajor: getDualMajorValue(doubleMajor, minorMajor),
      });

      console.log('학적 정보 저장 성공:', res.data.data);
      navigate('/onboarding/household');
    } catch (err) {
      console.error('학적 정보 저장 실패:', err);
      setSubmitError('학적 정보 저장에 실패했어요. 다시 시도해 주세요.');
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
              <div className="relative flex flex-col gap-2">
                <FieldLabel required>소속 학교</FieldLabel>
                <div className="flex w-full items-center gap-3 rounded-lg bg-[#F9FAFC] py-3 pl-6 pr-3">
                  <input
                    value={form.school}
                    onChange={updateField('school')}
                    onFocus={() => form.school.trim() && setShowUniversityDropdown(true)}
                    placeholder="학교명을 입력해 주세요"
                    className="w-full flex-1 bg-transparent text-[16px] font-medium leading-6 text-[#0A0C11] placeholder:text-[#9DA1AC] focus:outline-none"
                  />
                  <img src={searchIcon} alt="" className="size-[22px] shrink-0" />
                </div>

                {showUniversityDropdown && universityResults.length > 0 && (
                  <SearchDropdown
                    items={universityResults}
                    onSelect={handleSelectUniversity}
                    renderSubtext={(uni) => uni.region}
                  />
                )}
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
                <div className="relative flex flex-1 flex-col gap-2">
                  <FieldLabel required>전공명</FieldLabel>
                  <TextField
                    value={form.majorName}
                    onChange={updateField('majorName')}
                    placeholder="전공명을 입력해 주세요"
                  />

                  {showMajorDropdown && majorResults.length > 0 && (
                    <SearchDropdown
                      items={majorResults}
                      onSelect={handleSelectMajor}
                      renderSubtext={(major) => major.category}
                    />
                  )}
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
                      onClick={() => {
                        setDoubleMajor((v) => !v);
                        setMinorMajor(false);
                      }}
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
                      onClick={() => {
                        setMinorMajor((v) => !v);
                        setDoubleMajor(false);
                      }}
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

            {/* 제출 에러 메시지 */}
            {submitError && (
              <p className="mt-6 text-right text-[14px] font-medium leading-5 text-[#FA5862]">
                {submitError}
              </p>
            )}

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
