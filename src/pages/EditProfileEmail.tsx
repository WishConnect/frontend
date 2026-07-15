import {
  useState,
  useEffect,
  type ReactNode,
  type InputHTMLAttributes,
  type ChangeEvent,
} from 'react';
import logo from '../assets/logo.svg';

type Gender = 'female' | 'male' | 'none';
type Nationality = 'domestic' | 'foreign';

interface ProfileForm {
  newEmail: string;
  verificationCode: string;
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
  name: string;
  birthYear: string;
  contact: string;
  gender: Gender;
  nationality: Nationality;
  region: string;
}

interface ToggleOption<T extends string> {
  value: T;
  label: string;
  fixedWidth?: boolean;
  mutedLabel?: boolean;
}

// 아이콘들 — 별도 에셋 없이 인라인 SVG로 렌더
function EyeIcon() {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7Zm0 11.5A4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 0 1 0 9Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5c-7 0-11 7-11 7a19.44 19.44 0 0 0 4.06 4.87l-2.4 2.4a1 1 0 1 0 1.41 1.42l18-18a1 1 0 1 0-1.41-1.42l-2.51 2.51A11.6 11.6 0 0 0 12 5Zm0 4.5a4.47 4.47 0 0 1 1.29.19l-5.6 5.6A4.5 4.5 0 0 1 12 9.5Z" />
      <path d="M12 18.5c-3.5 0-6.32-1.87-8.24-3.87l1.42-1.42A17.28 17.28 0 0 0 8.6 16.1l1.55-1.55A4.5 4.5 0 0 0 16.1 8.6l1.72-1.72C20.3 8.53 23 12 23 12s-4 6.5-11 6.5Z" />
    </svg>
  );
}

function ChevronDownIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <svg
      className={className}
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

// 공통 입력 필드 라벨 (필수 표시 * 포함)
function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[16px] font-semibold leading-6 text-[#10131A]">{children}</span>
      {required && <span className="text-[16px] font-medium leading-6 text-[#FA5862]">*</span>}
    </div>
  );
}

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  rightSlot?: ReactNode;
}

function TextInput({ rightSlot, ...rest }: TextInputProps) {
  return (
    <div className="flex h-12 w-full items-center gap-6 rounded-lg bg-[#F9FAFC] px-6 py-3">
      <input
        className="w-full flex-1 bg-transparent text-[16px] font-medium leading-6 text-[#555964] placeholder:text-[#9DA1AC] focus:outline-none"
        {...rest}
      />
      {rightSlot}
    </div>
  );
}

// 공통 토글 선택 버튼 그룹 (성별, 국적 등에서 재사용)
interface SelectToggleGroupProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

function SelectToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: SelectToggleGroupProps<T>) {
  return (
    <div className="flex h-12 w-full items-center gap-2">
      {options.map((option) => {
        const isSelected = option.value === value;
        const style = isSelected
          ? { backgroundColor: '#7962ED', border: '1px solid #7962ED', color: '#FFFFFF' }
          : {
              backgroundColor: '#F9FAFC',
              border: '1px solid #E6E7EB',
              color: option.mutedLabel ? '#9DA1AC' : '#10131A',
            };
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isSelected}
            style={style}
            className={[
              'flex h-12 items-center justify-center rounded-lg px-6 py-3 text-[16px] font-medium leading-6 transition-colors',
              option.fixedWidth ? 'shrink-0' : 'flex-1',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// 지금은 하드코딩된 임의 값이지만, 실제로는 사용자가 입력/선택하는 항목입니다.
// 추후 API(회원가입 시 입력한 값 등)로 교체하면 됩니다.
const BIRTH_YEAR_OPTIONS: string[] = Array.from({ length: 60 }, (_, i) =>
  String(new Date().getFullYear() - i),
);

const REGION_OPTIONS: string[] = [
  '서울특별시 광진구',
  '서울특별시 강남구',
  '서울특별시 마포구',
  '경기도 성남시',
  '부산광역시 해운대구',
];

const VERIFICATION_DURATION_SECONDS = 180;

// 지금은 하드코딩된 기본값이지만, 추후 로그인/API 응답으로 이 객체를 채우면 됩니다.
const DEFAULT_FORM: ProfileForm = {
  newEmail: '',
  verificationCode: '',
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
  name: '김위시',
  birthYear: '2004',
  contact: '',
  gender: 'female',
  nationality: 'domestic',
  region: '서울특별시 광진구',
};

function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function EditProfileEmailChange() {
  const [form, setForm] = useState<ProfileForm>(DEFAULT_FORM);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showNewPwConfirm, setShowNewPwConfirm] = useState(false);

  const [verificationStarted, setVerificationStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(VERIFICATION_DURATION_SECONDS);

  useEffect(() => {
    if (!verificationStarted) return;
    if (secondsLeft === 0) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [verificationStarted, secondsLeft]);

  const isCodeExpired = verificationStarted && secondsLeft === 0;

  const updateField =
    (field: keyof ProfileForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleResendCode = () => {
    // TODO: 실제 인증코드 재전송 API 연동
    setSecondsLeft(VERIFICATION_DURATION_SECONDS);
    setVerificationStarted(true);
  };

  const handleVerifyCode = () => {
    if (!form.newEmail.trim()) return;

    if (!verificationStarted) {
      setSecondsLeft(VERIFICATION_DURATION_SECONDS);
      setVerificationStarted(true);
    }

    console.log('인증코드 확인:', form.verificationCode);
  };

  const handleCheckEmailDuplicate = () => {
    console.log('이메일 중복 확인:', form.newEmail);
  };

  const handleSubmit = () => {
    console.log('수정완료:', form);
  };

  return (
    <div className="relative left-1/2 w-screen -ml-[50vw] min-h-screen bg-white text-left font-['Pretendard',sans-serif]">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* 상단바 */}
        <header className="h-20 w-full">
          <div className="flex h-full items-center px-16">
            <img src={logo} alt="WISHCONNECT" className="h-8" />
          </div>
        </header>

        <main className="flex flex-col gap-12 px-[109px] pb-12 pt-8">
          {/* 페이지 타이틀 */}
          <div className="flex w-full flex-col items-start gap-1">
            <h1 className="w-full text-left text-[36px] font-bold leading-[48px] tracking-[-0.54px] text-[#10131A]">
              프로필 관리
            </h1>
            <p className="w-full text-left text-[16px] font-medium leading-6 text-[#555964]">
              입력한 정보는 안전하게 보호되며, 장학금 추천 목적 외에는 사용되지 않아요.
            </p>
          </div>

          <div className="flex w-full flex-col gap-8">
            {/* 이메일 주소 (변경 중 상태) */}
            <div className="flex w-full flex-col items-start gap-2">
              <FieldLabel required>이메일 주소</FieldLabel>
              <div className="flex w-full items-center gap-6">
                <TextInput
                  type="email"
                  value={form.newEmail}
                  onChange={updateField('newEmail')}
                  placeholder="변경할 이메일 주소를 입력해주세요."
                />
                <button
                  type="button"
                  onClick={handleCheckEmailDuplicate}
                  style={{ backgroundColor: '#F3F4F6', border: '1px solid transparent' }}
                  className="flex h-12 w-[140px] shrink-0 items-center justify-center rounded-lg px-4 py-2 text-[16px] font-medium leading-6 text-[#9DA1AC]"
                >
                  중복 확인
                </button>
              </div>
              <p className="text-[14px] font-medium leading-5 text-[#747883]">
                ※ 이메일 중복을 확인해주세요.
              </p>
            </div>

            {/* 인증코드 (이메일 변경 시에만 노출되는 섹션) */}
            <div className="flex w-full flex-col items-start gap-2">
              <FieldLabel required>인증코드</FieldLabel>
              <div className="flex w-full items-center gap-6">
                <div className="flex h-12 w-full flex-1 items-center gap-6 rounded-lg bg-[#F9FAFC] px-6 py-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.verificationCode}
                    onChange={updateField('verificationCode')}
                    placeholder="인증코드 6자리를 입력하세요"
                    className="w-full flex-1 bg-transparent text-[16px] font-medium leading-6 text-[#555964] placeholder:text-[#9DA1AC] focus:outline-none"
                  />
                  <span
                    className={`shrink-0 text-[16px] font-medium leading-6 ${isCodeExpired ? 'text-[#FA5862]' : 'text-[#9DA1AC]'}`}
                  >
                    {formatMMSS(secondsLeft)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  style={{ backgroundColor: '#F3F4F6', border: '1px solid transparent' }}
                  className="flex h-12 w-[140px] shrink-0 items-center justify-center rounded-lg px-4 py-2 text-[16px] font-medium leading-6 text-[#9DA1AC]"
                >
                  인증하기
                </button>
              </div>
              <button
                type="button"
                onClick={handleResendCode}
                style={{ backgroundColor: 'transparent', border: 'none' }}
                className="text-left text-[14px] font-medium leading-5 text-[#747883] underline"
              >
                ※ 인증코드를 받지 못하셨나요? {isCodeExpired ? '재전송하기' : ''}
              </button>
            </div>

            {/* 현재 비밀번호 / 새 비밀번호 / 새 비밀번호 확인 */}
            <div className="flex w-full items-start gap-6">
              <div className="flex flex-1 flex-col items-start gap-2">
                <FieldLabel required>현재 비밀번호</FieldLabel>
                <TextInput
                  type={showCurrentPw ? 'text' : 'password'}
                  value={form.currentPassword}
                  onChange={updateField('currentPassword')}
                  placeholder="비밀번호를 다시 입력하세요"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw((v) => !v)}
                      className="text-[#9DA1AC]"
                    >
                      {showCurrentPw ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  }
                />
              </div>
              <div className="flex flex-1 flex-col items-start gap-2">
                <FieldLabel required>새 비밀번호</FieldLabel>
                <TextInput
                  type={showNewPw ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={updateField('newPassword')}
                  placeholder="비밀번호를 다시 입력하세요"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowNewPw((v) => !v)}
                      className="text-[#9DA1AC]"
                    >
                      {showNewPw ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  }
                />
              </div>
              <div className="flex flex-1 flex-col items-start gap-2">
                <FieldLabel required>새 비밀번호 확인</FieldLabel>
                <TextInput
                  type={showNewPwConfirm ? 'text' : 'password'}
                  value={form.newPasswordConfirm}
                  onChange={updateField('newPasswordConfirm')}
                  placeholder="비밀번호를 다시 입력하세요"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowNewPwConfirm((v) => !v)}
                      className="text-[#9DA1AC]"
                    >
                      {showNewPwConfirm ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  }
                />
              </div>
            </div>

            {/* 이름 / 출생년도 */}
            <div className="flex w-full items-start gap-8">
              <div className="flex flex-1 flex-col items-start gap-2">
                <FieldLabel required>이름</FieldLabel>
                <TextInput
                  value={form.name}
                  onChange={updateField('name')}
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div className="flex flex-1 flex-col items-start gap-2">
                <FieldLabel required>출생년도</FieldLabel>
                <div className="relative flex h-12 w-full items-center rounded-lg bg-[#F9FAFC] pl-6 pr-3">
                  <select
                    value={form.birthYear}
                    onChange={updateField('birthYear')}
                    className="w-full flex-1 appearance-none bg-transparent text-[16px] font-medium leading-6 text-[#555964] focus:outline-none"
                  >
                    {BIRTH_YEAR_OPTIONS.map((year) => (
                      <option key={year} value={year}>
                        {year}.01.01
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none size-6 shrink-0 text-[#9DA1AC]" />
                </div>
              </div>
            </div>

            {/* 연락처 / 성별 */}
            <div className="flex w-full items-start gap-8">
              <div className="flex flex-1 flex-col items-start gap-2">
                <FieldLabel required>연락처</FieldLabel>
                <TextInput
                  type="tel"
                  value={form.contact}
                  onChange={updateField('contact')}
                  placeholder="010-0000-0000"
                />
              </div>
              <div className="flex flex-1 flex-col items-start gap-2">
                <FieldLabel required>성별</FieldLabel>
                <SelectToggleGroup<Gender>
                  value={form.gender}
                  onChange={(v) => setForm((prev) => ({ ...prev, gender: v }))}
                  options={[
                    { value: 'female', label: '여성' },
                    { value: 'male', label: '남성' },
                    { value: 'none', label: '선택 안함', fixedWidth: true, mutedLabel: true },
                  ]}
                />
              </div>
            </div>

            {/* 국적 / 거주 지역 */}
            <div className="flex w-full items-start gap-8">
              <div className="flex flex-1 flex-col items-start gap-2">
                <FieldLabel required>국적</FieldLabel>
                <SelectToggleGroup<Nationality>
                  value={form.nationality}
                  onChange={(v) => setForm((prev) => ({ ...prev, nationality: v }))}
                  options={[
                    { value: 'domestic', label: '내국인' },
                    { value: 'foreign', label: '외국인' },
                  ]}
                />
              </div>
              <div className="flex flex-1 flex-col items-start gap-2">
                <FieldLabel required>거주 지역</FieldLabel>
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="relative flex h-12 w-full items-center rounded-lg bg-[#F9FAFC] pl-6 pr-3">
                    <select
                      value={form.region}
                      onChange={updateField('region')}
                      className="w-full flex-1 appearance-none bg-transparent text-[16px] font-medium leading-6 text-[#555964] focus:outline-none"
                    >
                      {REGION_OPTIONS.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none size-6 shrink-0 text-[#9DA1AC]" />
                  </div>
                  <p className="text-[14px] font-medium leading-5 text-[#747883]">
                    ※ 장학금 추천 시 거주 지역 기준이 활용될 수 있어요.
                  </p>
                </div>
              </div>
            </div>

            {/* 하단 버튼 — 라우팅은 추후 연결 */}
            <div className="flex w-full items-center justify-end gap-4">
              <button
                type="button"
                style={{ backgroundColor: '#F3F4F6', border: '1px solid transparent' }}
                className="flex h-[60px] items-center gap-4 rounded-lg py-4 pl-4 pr-8 text-[20px] font-medium leading-7 text-[#747883]"
              >
                <ChevronLeftIcon />
                돌아가기
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                style={{ backgroundColor: '#F3F4F6', border: '1px solid transparent' }}
                className="flex h-[60px] items-center gap-4 rounded-lg px-8 py-4 text-[20px] font-bold leading-7 text-[#9DA1AC]"
              >
                수정완료
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
