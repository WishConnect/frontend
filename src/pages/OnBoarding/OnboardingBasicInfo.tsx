import { useState, useEffect, useMemo, type ReactNode, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import OnboardingStepSidebar from '../../components/onboarding/OnboardingStepSidebar';
import { putBasicProfile } from '../../api/onboarding/profile';
import { getRegions } from '../../api/region';
import type { Region } from '../../types/region';
import { formatPhone, getPhoneError } from '../../utils/phone';

// 만 14세 이상만 가입할 수 있어(약관 필수 동의) 고를 수 있는 가장 늦은 생일은
// "오늘로부터 14년 전의 같은 날짜"다. 회원가입(SignPage)과 같은 규칙.
const MIN_AGE = 14;

type Gender = 'female' | 'male' | 'none';
type Nationality = 'domestic' | 'foreign';

const GENDER_TO_API: Record<Gender, string> = {
  female: 'FEMALE',
  male: 'MALE',
  none: 'NONE',
};

const NATIONALITY_TO_API: Record<Nationality, string> = {
  domestic: 'DOMESTIC',
  foreign: 'FOREIGN',
};

function ChevronDownIcon() {
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

// 시안의 상단 사람 아이콘. assets/onboarding 에는 학사모·시계 등만 있어 인라인으로 그렸다.
function PersonIcon() {
  return (
    <svg
      className="size-12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#7962ED"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" />
    </svg>
  );
}

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
  maxLength,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <div className="flex w-full items-center rounded-lg bg-[#F9FAFC] px-6 py-3">
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
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
  disabled,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <div className="relative flex w-full items-center rounded-lg bg-[#F9FAFC] py-3 pl-6 pr-3">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none bg-transparent pr-8 text-[16px] font-medium leading-6 focus:outline-none disabled:cursor-not-allowed ${
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
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <ChevronDownIcon />
      </div>
    </div>
  );
}

// 성별·국적처럼 몇 개 안 되는 선택지는 버튼을 나란히 둔다(시안).
function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | null;
  onChange: (value: T) => void;
  options: { value: T; label: string; muted?: boolean }[];
}) {
  return (
    <div className="flex w-full items-center gap-2">
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isSelected}
            className={`flex h-12 flex-1 items-center justify-center rounded-lg border text-[16px] font-medium leading-6 transition-colors ${
              isSelected
                ? 'border-[#7962ED] bg-[#7962ED] text-white'
                : `border-[#E6E7EB] bg-[#F9FAFC] ${option.muted ? 'text-[#9DA1AC]' : 'text-[#0A0C11]'}`
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 소셜 로그인 온보딩 STEP 1 — 기본 정보.
 *
 * 소셜 가입은 이름·생년월일·연락처·성별·국적·거주지역을 받지 못해서 여기서 한 번에 받는다.
 * 일반 회원가입은 가입 때 이미 받았으므로 이 화면을 거치지 않는다(3단계 그대로).
 *
 * 저장은 PUT /users/me/profile/basic — 마이페이지 프로필 수정과 같은 엔드포인트다
 * (백엔드 Swagger: "소셜 로그인 온보딩 STEP 1 또는 마이페이지 프로필 수정에서 …").
 */
export default function OnboardingBasicInfo() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [nationality, setNationality] = useState<Nationality | null>(null);
  const [region, setRegion] = useState('');

  const [regions, setRegions] = useState<Region[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 거주 지역 목록. 실패해도 화면을 막지 않고 안내만 남긴다.
  useEffect(() => {
    let isMounted = true;

    getRegions()
      .then((response) => {
        if (isMounted) setRegions(response.data.data);
      })
      .catch((err) => {
        console.error('거주 지역 목록 조회 실패:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 만 14세가 되는 날을 넘지 않도록 연도 상한을 잡는다.
  const yearOptions = useMemo(() => {
    const maxYear = new Date().getFullYear() - MIN_AGE;
    return Array.from({ length: 80 }, (_, i) => String(maxYear - i));
  }, []);

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')),
    [],
  );

  // 월마다 말일이 다르고 윤년도 있어서, 고른 연·월에 실제로 존재하는 날짜만 보여준다.
  const dayOptions = useMemo(() => {
    if (!birthYear || !birthMonth) return [];
    const lastDay = new Date(Number(birthYear), Number(birthMonth), 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => String(i + 1).padStart(2, '0'));
  }, [birthYear, birthMonth]);

  // 월을 바꿔 존재하지 않는 날짜가 됐으면(1/31 -> 2월) 일 선택을 비운다.
  const handleMonthChange = (value: string) => {
    setBirthMonth(value);
    if (birthYear && value && birthDay) {
      const lastDay = new Date(Number(birthYear), Number(value), 0).getDate();
      if (Number(birthDay) > lastDay) setBirthDay('');
    }
  };

  const birthDate =
    birthYear && birthMonth && birthDay ? `${birthYear}-${birthMonth}-${birthDay}` : '';

  const handleNext = async () => {
    if (!name.trim()) {
      setSubmitError('이름을 입력해 주세요.');
      return;
    }
    if (!birthDate) {
      setSubmitError('생년월일을 모두 선택해 주세요.');
      return;
    }
    const phoneError = getPhoneError(phone);
    if (phoneError) {
      setSubmitError(phoneError);
      return;
    }
    if (!gender) {
      setSubmitError('성별을 선택해 주세요.');
      return;
    }
    if (!nationality) {
      setSubmitError('국적을 선택해 주세요.');
      return;
    }
    if (!region) {
      setSubmitError('거주 지역을 선택해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await putBasicProfile({
        name: name.trim(),
        birthDate,
        phone: phone.trim(),
        gender: GENDER_TO_API[gender],
        nationality: NATIONALITY_TO_API[nationality],
        region,
      });
      navigate('/onboarding');
    } catch (err) {
      console.error('기본 정보 저장 실패:', err);
      setSubmitError('기본 정보 저장에 실패했어요. 입력한 내용을 다시 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-[1440px] bg-white text-left font-['Pretendard',sans-serif]">
      <div className="relative mx-auto w-full">
        <Header logoOnly />

        <div className="flex px-[64px]">
          {/* 좌측 스텝 사이드바 (소셜은 기본 정보가 STEP 1) */}
          <OnboardingStepSidebar current="basic" includeBasicStep />

          <main className="flex min-w-0 flex-1 items-start pb-16 pt-4">
            <section className="flex flex-1 flex-col">
              <div className="flex size-20 items-center justify-center rounded-full bg-[#F9FAFC]">
                <PersonIcon />
              </div>

              <h1 className="mt-6 text-[32px] font-bold leading-[44px] text-[#0A0C11]">
                기본 정보를 입력해 주세요.
              </h1>
              <p className="mt-2 text-[16px] font-medium leading-6 text-[#747883]">
                입력한 정보는 안전하게 보호되며, 장학금 추천 목적 외에는 사용되지 않아요.
              </p>

              {/* 시안대로 2열 배치 */}
              <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8">
                <div className="flex flex-col gap-3">
                  <FieldLabel required>이름</FieldLabel>
                  <TextField
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력해 주세요"
                    maxLength={30}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <FieldLabel required>생년월일</FieldLabel>
                  <div className="flex items-center gap-3">
                    <SelectField
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      placeholder="년"
                      options={yearOptions}
                    />
                    <SelectField
                      value={birthMonth}
                      onChange={(e) => handleMonthChange(e.target.value)}
                      placeholder="월"
                      options={monthOptions}
                    />
                    <SelectField
                      value={birthDay}
                      onChange={(e) => setBirthDay(e.target.value)}
                      placeholder="일"
                      options={dayOptions}
                      disabled={dayOptions.length === 0}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <FieldLabel required>연락처</FieldLabel>
                  {/* 숫자만 받고 하이픈은 자동으로 넣는다(010-1234-5678). */}
                  <TextField
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="연락처를 입력해 주세요"
                    maxLength={13}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <FieldLabel required>성별</FieldLabel>
                  <ToggleGroup<Gender>
                    value={gender}
                    onChange={setGender}
                    options={[
                      { value: 'female', label: '여성' },
                      { value: 'male', label: '남성' },
                      { value: 'none', label: '선택 안함', muted: true },
                    ]}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <FieldLabel required>국적</FieldLabel>
                  <ToggleGroup<Nationality>
                    value={nationality}
                    onChange={setNationality}
                    options={[
                      { value: 'domestic', label: '내국인' },
                      { value: 'foreign', label: '외국인' },
                    ]}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <FieldLabel required>거주 지역</FieldLabel>
                  <SelectField
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="선택해 주세요"
                    options={regions.map((item) => item.name)}
                    disabled={regions.length === 0}
                  />
                  <p className="text-[14px] font-medium leading-5 text-[#747883]">
                    ※ 장학금 추천 시 거주 지역 기준이 활용될 수 있어요.
                  </p>
                </div>
              </div>

              {submitError && (
                <p className="mt-8 text-right text-[14px] font-medium leading-5 text-[#FA5862]">
                  {submitError}
                </p>
              )}

              <div className="mt-16 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-4 rounded-lg bg-[#F3F4F6] py-4 pl-4 pr-8 text-[20px] font-medium leading-7 tracking-[-0.1px] text-[#747883]"
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
        </div>
      </div>
    </div>
  );
}
