import {
  useState,
  useEffect,
  type ReactNode,
  type InputHTMLAttributes,
  type ChangeEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { putBasicProfile, getMyProfile } from '../api/onboarding/profile';
import {
  updatePassword,
  updateEmail,
  checkEmailDuplicate,
  sendEmailVerification,
  verifyEmailCode,
} from '../api/mypage/mypage';
import { useUserStore } from '../store/user/user';
import { tokenStorage } from '../utils/token';

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

// ------------------------------------------------------------------
// 거주 지역: /mypage/edit(EditProfile.tsx)와 동일하게 광역자치단체(도) 단위
// 17개로 통일. 이 페이지만 예전 시/군/구 단위 옵션으로 따로 놀고 있었음.
// ------------------------------------------------------------------
const REGION_OPTIONS: string[] = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원특별자치도',
  '충청북도',
  '충청남도',
  '전북특별자치도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
];

// GET /api/v1/users/me/profile 의 region은 "서울" 같은 축약형으로 내려오므로
// REGION_OPTIONS(정식 명칭)와 매칭시키기 위한 별칭 테이블.
const REGION_ALIASES: Record<string, string> = {
  서울: '서울특별시',
  부산: '부산광역시',
  대구: '대구광역시',
  인천: '인천광역시',
  광주: '광주광역시',
  대전: '대전광역시',
  울산: '울산광역시',
  세종: '세종특별자치시',
  경기: '경기도',
  강원: '강원특별자치도',
  충북: '충청북도',
  충남: '충청남도',
  전북: '전북특별자치도',
  전남: '전라남도',
  경북: '경상북도',
  경남: '경상남도',
  제주: '제주특별자치도',
};

function normalizeRegion(region: string | null | undefined): string {
  if (!region) return REGION_OPTIONS[0];
  if (REGION_OPTIONS.includes(region)) return region;
  return REGION_ALIASES[region] ?? REGION_OPTIONS[0];
}

const VERIFICATION_DURATION_SECONDS = 180;

// 지금은 하드코딩된 기본값이지만, 화면 진입 시 getMyProfile() 응답으로 덮어씌워짐.
// API 로드가 실패했을 때만 이 값이 그대로 보임.
const DEFAULT_FORM: ProfileForm = {
  newEmail: '',
  verificationCode: '',
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
  name: '',
  birthYear: String(new Date().getFullYear()),
  contact: '',
  gender: 'none',
  nationality: 'domestic',
  region: REGION_OPTIONS[0],
};

function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ------------------------------------------------------------------
// 연락처 자동 하이픈 포맷팅: 숫자만 입력해도(예: "01012345678")
// "010-1234-5678" 형태로 자동 변환. 최대 11자리(휴대폰 번호)까지만 받고,
// 10자리(구형 번호)는 3-3-4로, 11자리는 3-4-4로 나눈다.
// ------------------------------------------------------------------
function formatPhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);

  if (digits.length < 4) return digits;
  if (digits.length < 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

// ------------------------------------------------------------------
// 폼의 내부 값(female/male/none, domestic/foreign)을 API가 기대하는
// 값으로 변환. GET /api/v1/users/me/profile 응답 기준으로 gender/nationality는
// "FEMALE"/"DOMESTIC" 같은 영문 enum이라 그에 맞춤.
// (기존엔 한글 문자열('여성' 등)을 보내고 있었는데, 실제 API 응답 확인 결과와
//  달라서 /mypage/edit(EditProfile.tsx)과 동일한 매핑으로 통일함)
// ------------------------------------------------------------------
function mapGenderToApiValue(gender: Gender): string {
  const map: Record<Gender, string> = { female: 'FEMALE', male: 'MALE', none: 'NONE' };
  return map[gender];
}

function mapNationalityToApiValue(nationality: Nationality): string {
  return nationality === 'domestic' ? 'DOMESTIC' : 'FOREIGN';
}

// API가 준 enum 값을 폼 내부 값으로 역변환
function mapApiValueToGender(value: string): Gender {
  if (value === 'FEMALE') return 'female';
  if (value === 'MALE') return 'male';
  return 'none';
}

function mapApiValueToNationality(value: string): Nationality {
  return value === 'FOREIGN' ? 'foreign' : 'domestic';
}

export default function EditProfileEmailChange() {
  const navigate = useNavigate();
  const clearUser = useUserStore((s) => s.clearUser);

  const [form, setForm] = useState<ProfileForm>(DEFAULT_FORM);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showNewPwConfirm, setShowNewPwConfirm] = useState(false);

  // 화면 진입 시 실제 유저 프로필 로드 (이름/생년/연락처/성별/국적/지역 prefill)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [verificationStarted, setVerificationStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(VERIFICATION_DURATION_SECONDS);

  // 이메일 중복 확인 상태
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailCheckError, setEmailCheckError] = useState<string | null>(null);

  // 인증코드 발송 상태
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [sendCodeError, setSendCodeError] = useState<string | null>(null);

  // 인증코드 확인 상태
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [verifyCodeError, setVerifyCodeError] = useState<string | null>(null);

  // 최종 저장 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // GET /users/me/profile 로 이름/생년/연락처/성별/국적/지역을 채움.
  // newEmail/인증 관련 필드는 이 화면에서 새로 입력받는 값이라 건드리지 않는다.
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        const profile = res.data.data;

        setForm((prev) => ({
          ...prev,
          name: profile.name,
          birthYear: profile.birthYear || prev.birthYear,
          contact: formatPhoneNumber(profile.phone ?? ''),
          gender: mapApiValueToGender(profile.gender),
          nationality: mapApiValueToNationality(profile.nationality),
          region: normalizeRegion(profile.region),
        }));
      } catch (err) {
        console.error('프로필 정보 조회 실패:', err);
        setLoadError('프로필 정보를 불러오지 못했어요. 기본값으로 표시됩니다.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

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

  // 연락처 입력 시 숫자만 추출해서 자동으로 하이픈을 다시 끼워넣는다.
  const handleContactChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, contact: formatPhoneNumber(e.target.value) }));
  };

  // 이메일을 다시 입력하면 이전 중복확인/인증 상태는 전부 무효화
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, newEmail: e.target.value, verificationCode: '' }));
    setEmailAvailable(null);
    setEmailCheckError(null);
    setVerificationStarted(false);
    setCodeVerified(false);
    setVerifyCodeError(null);
  };

  const handleBack = () => {
    navigate('/mypage');
  };

  // 1) 이메일 중복 확인
  const handleCheckEmailDuplicate = async () => {
    if (!form.newEmail.trim()) return;

    setIsCheckingEmail(true);
    setEmailCheckError(null);

    try {
      const res = await checkEmailDuplicate({ email: form.newEmail });
      setEmailAvailable(res.data.data.available);
      if (!res.data.data.available) {
        setEmailCheckError('이미 사용 중인 이메일이에요.');
      }
    } catch (err) {
      console.error('이메일 중복 확인 실패:', err);
      setEmailCheckError('중복 확인에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // 2) 인증코드 발송 (재전송 버튼에서도 재사용)
  const handleSendCode = async () => {
    if (!form.newEmail.trim()) return;

    setIsSendingCode(true);
    setSendCodeError(null);

    try {
      await sendEmailVerification({ email: form.newEmail });
      setSecondsLeft(VERIFICATION_DURATION_SECONDS);
      setVerificationStarted(true);
      setCodeVerified(false);
      setVerifyCodeError(null);
    } catch (err) {
      console.error('인증코드 발송 실패:', err);
      setSendCodeError('인증코드 발송에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 3) 인증하기 버튼 — 아직 코드 발송 전이면 발송, 발송 후면 입력한 코드로 검증
  const handleVerifyCode = async () => {
    if (!form.newEmail.trim()) return;

    if (!verificationStarted) {
      await handleSendCode();
      return;
    }

    if (!form.verificationCode.trim()) return;

    setIsVerifyingCode(true);
    setVerifyCodeError(null);

    try {
      const res = await verifyEmailCode({ email: form.newEmail, code: form.verificationCode });
      setCodeVerified(res.data.data.updated);
      if (!res.data.data.updated) {
        setVerifyCodeError('인증코드가 올바르지 않아요.');
      }
    } catch (err) {
      console.error('인증코드 확인 실패:', err);
      setVerifyCodeError('인증코드 확인에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendCode = () => {
    handleSendCode();
  };

  const handleSubmit = async () => {
    const emailChanged = form.newEmail.trim() !== '';

    if (emailChanged && !codeVerified) {
      setSubmitError('이메일 인증을 완료해 주세요.');
      return;
    }

    // 비밀번호 필드 중 하나라도 입력했다면 비밀번호 변경도 같이 진행
    const wantsPasswordChange =
      form.currentPassword.trim() !== '' ||
      form.newPassword.trim() !== '' ||
      form.newPasswordConfirm.trim() !== '';

    if (wantsPasswordChange) {
      if (
        form.currentPassword.trim() === '' ||
        form.newPassword.trim() === '' ||
        form.newPasswordConfirm.trim() === ''
      ) {
        setSubmitError('비밀번호를 변경하려면 세 항목을 모두 입력해 주세요.');
        return;
      }
      if (form.newPassword !== form.newPasswordConfirm) {
        setSubmitError('새 비밀번호와 새 비밀번호 확인이 일치하지 않아요.');
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 기본 정보 저장
      await putBasicProfile({
        name: form.name,
        birthYear: form.birthYear,
        phone: form.contact,
        gender: mapGenderToApiValue(form.gender),
        nationality: mapNationalityToApiValue(form.nationality),
        region: form.region,
      });

      // 인증이 완료된 이메일이 있으면 최종 반영
      if (emailChanged) {
        await updateEmail({ email: form.newEmail });
      }

      if (wantsPasswordChange) {
        await updatePassword({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          newPasswordConfirm: form.newPasswordConfirm,
        });

        // 비밀번호 변경 성공 시 서버에서 기존 refreshToken이 무효화되므로
        // 클라이언트도 로그아웃 처리 후 재로그인 유도
        clearUser();
        tokenStorage.clearTokens();
        navigate('/login');
        return;
      }

      navigate('/mypage');
    } catch (err) {
      console.error('프로필 수정 실패:', err);
      setSubmitError('저장에 실패했어요. 입력한 내용을 다시 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyButtonLabel = isSendingCode
    ? '발송 중...'
    : isVerifyingCode
      ? '확인 중...'
      : !verificationStarted
        ? '인증코드 받기'
        : codeVerified
          ? '인증완료'
          : '인증하기';

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

          {loadError && (
            <div className="flex w-full items-center gap-2 rounded-lg bg-[#FEF2F2] px-6 py-3">
              <p className="text-[14px] font-medium leading-5 text-[#FA5862]">{loadError}</p>
            </div>
          )}

          <div className={`flex w-full flex-col gap-8 ${isLoadingProfile ? 'opacity-60' : ''}`}>
            {/* 이메일 주소 (변경 중 상태) */}
            <div className="flex w-full flex-col items-start gap-2">
              <FieldLabel required>이메일 주소</FieldLabel>
              <div className="flex w-full items-center gap-6">
                <TextInput
                  type="email"
                  value={form.newEmail}
                  onChange={handleEmailChange}
                  placeholder="변경할 이메일 주소를 입력해주세요."
                />
                <button
                  type="button"
                  onClick={handleCheckEmailDuplicate}
                  disabled={isCheckingEmail || !form.newEmail.trim()}
                  style={{ backgroundColor: '#F3F4F6', border: '1px solid transparent' }}
                  className="flex h-12 w-[140px] shrink-0 items-center justify-center rounded-lg px-4 py-2 text-[16px] font-medium leading-6 text-[#9DA1AC] disabled:opacity-60"
                >
                  {isCheckingEmail ? '확인 중...' : '중복 확인'}
                </button>
              </div>
              {emailCheckError ? (
                <p className="text-[14px] font-medium leading-5 text-[#FA5862]">
                  {emailCheckError}
                </p>
              ) : emailAvailable ? (
                <p className="text-[14px] font-medium leading-5 text-[#22C55E]">
                  사용 가능한 이메일이에요.
                </p>
              ) : (
                <p className="text-[14px] font-medium leading-5 text-[#747883]">
                  ※ 이메일 중복을 확인해주세요.
                </p>
              )}
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
                  {verificationStarted && (
                    <span
                      className={`shrink-0 text-[16px] font-medium leading-6 ${isCodeExpired ? 'text-[#FA5862]' : 'text-[#9DA1AC]'}`}
                    >
                      {formatMMSS(secondsLeft)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={
                    isSendingCode ||
                    isVerifyingCode ||
                    codeVerified ||
                    !form.newEmail.trim() ||
                    (verificationStarted && !form.verificationCode.trim())
                  }
                  style={{ backgroundColor: '#F3F4F6', border: '1px solid transparent' }}
                  className="flex h-12 w-[140px] shrink-0 items-center justify-center rounded-lg px-4 py-2 text-[16px] font-medium leading-6 text-[#9DA1AC] disabled:opacity-60"
                >
                  {verifyButtonLabel}
                </button>
              </div>
              {sendCodeError && (
                <p className="text-[14px] font-medium leading-5 text-[#FA5862]">{sendCodeError}</p>
              )}
              {verifyCodeError && (
                <p className="text-[14px] font-medium leading-5 text-[#FA5862]">
                  {verifyCodeError}
                </p>
              )}
              {verificationStarted && !codeVerified && (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isSendingCode}
                  style={{ backgroundColor: 'transparent', border: 'none' }}
                  className="text-left text-[14px] font-medium leading-5 text-[#747883] underline disabled:opacity-60"
                >
                  ※ 인증코드를 받지 못하셨나요? {isCodeExpired ? '재전송하기' : ''}
                </button>
              )}
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
                  inputMode="numeric"
                  value={form.contact}
                  onChange={handleContactChange}
                  placeholder="010-0000-0000"
                  maxLength={13}
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

            {/* 저장 에러 메시지 */}
            {submitError && (
              <p className="text-right text-[14px] font-medium leading-5 text-[#FA5862]">
                {submitError}
              </p>
            )}

            {/* 하단 버튼 */}
            <div className="flex w-full items-center justify-end gap-4">
              <button
                type="button"
                onClick={handleBack}
                style={{ backgroundColor: '#F3F4F6', border: '1px solid transparent' }}
                className="flex h-[60px] items-center gap-4 rounded-lg py-4 pl-4 pr-8 text-[20px] font-medium leading-7 text-[#747883]"
              >
                <ChevronLeftIcon />
                돌아가기
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#7962ED',
                  border: '1px solid #7962ED',
                  opacity: isSubmitting ? 0.6 : 1,
                }}
                className="flex h-[60px] items-center gap-4 rounded-lg px-8 py-4 text-[20px] font-bold leading-7 text-white"
              >
                {isSubmitting ? '저장 중...' : '수정완료'}
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
