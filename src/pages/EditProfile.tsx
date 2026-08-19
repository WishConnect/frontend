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
import { getRegions, getRegionChildren } from '../api/region';
import { updatePassword, getMyPageSummary } from '../api/mypage/mypage';
import { useUserStore } from '../store/user/user';
import { tokenStorage } from '../utils/token';
import { formatPhone, getPhoneError } from '../utils/phone';
import type { Region } from '../types/region';

type Gender = 'female' | 'male' | 'none';
type Nationality = 'domestic' | 'foreign';

interface ProfileForm {
  email: string;
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
  name: string;
  // 캘린더 피커용 전체 생년월일 (yyyy-MM-dd). API도 이제 이 필드명(birthDate)과
  // 형식을 그대로 사용하므로 별도 변환 없이 그대로 보낸다.
  birthDate: string;
  contact: string;
  // 거주 지역은 시도 + 시군구 2단계다. 서버로는 "서울 중구" 처럼 한 문자열로 합쳐 보낸다
  // (ProfileBasicRequest.region 이 String 하나뿐이라 필드를 나눠 보낼 수 없다).
  sigungu: string;
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

// (normalizeRegion 은 삭제했다) 조회 응답의 region 이 2026-08-19부터 문자열이 아니라
// Region 객체로 오면서(백엔드 539c0ae) 이름을 목록과 대조해 맞출 필요가 없어졌다.
// 시군구면 parentName 에 상위 시도가 실려 오므로 어느 시도의 "중구"인지도 바로 알 수 있다.

// 지금은 하드코딩된 기본값이지만, 추후 로그인/API 응답으로 이 객체를 채우면 됩니다.
const DEFAULT_FORM: ProfileForm = {
  email: 'wishconnect@gmail.com',
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
  name: '김위시',
  birthDate: '2004-01-01',
  contact: '',
  sigungu: '',
  gender: 'female',
  nationality: 'domestic',
  region: '',
};

// ------------------------------------------------------------------
// 폼의 내부 값(female/male/none, domestic/foreign)을 API가 기대하는
// 값으로 변환. GET /api/v1/users/me/profile 응답 기준으로 gender/nationality는
// "FEMALE"/"DOMESTIC" 같은 영문 enum.
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

// axios 에러 응답에서 서버가 내려준 실제 메시지를 최대한 뽑아낸다.
// 우리 API 응답 포맷이 { success, data, message } 형태라 message를 우선 사용하고,
// 없으면 axios 기본 에러 메시지, 그것도 없으면 지금까지 쓰던 기본 문구로 폴백한다.
function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const maybeAxiosErr = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    const serverMessage = maybeAxiosErr.response?.data?.message;
    if (serverMessage) return serverMessage;
    if (maybeAxiosErr.message) return maybeAxiosErr.message;
  }
  return fallback;
}

export default function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileForm>(DEFAULT_FORM);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showNewPwConfirm, setShowNewPwConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(true);
  const [regionLoadError, setRegionLoadError] = useState<string | null>(null);
  // 시군구(2단계). 결과와 실패 사유를 시도 이름으로 캐시한다 — 시도를 바꿨을 때 이전 목록이
  // 남아 보이지 않고, effect 안에서 동기적으로 비울 필요도 없다.
  const [sigunguCache, setSigunguCache] = useState<Record<string, Region[]>>({});
  const [sigunguErrorByRegion, setSigunguErrorByRegion] = useState<Record<string, string>>({});
  const clearUser = useUserStore((s) => s.clearUser);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await getRegions();
        setRegions(response.data.data);
      } catch (err) {
        console.error('거주 지역 목록 조회 실패:', err);
        setRegionLoadError('거주 지역 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      } finally {
        setIsLoadingRegions(false);
      }
    };

    fetchRegions();
  }, []);

  // 화면 진입 시 실제 유저 프로필을 불러와서 폼에 채워넣음.
  // getMyProfile(GET /users/me/profile)에서 이름/생년월일/연락처/성별/국적/지역을,
  // getMyPageSummary(GET /users/me)에서 이메일을 각각 가져와 합친다.
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, summaryRes] = await Promise.all([getMyProfile(), getMyPageSummary()]);
        const profile = profileRes.data.data;
        const summary = summaryRes.data.data;

        // profile.birthDate가 이미 "yyyy-MM-dd" 전체 날짜로 오므로 그대로 사용.
        // 값이 없으면(신규 유저 등) 올해 1월 1일로 폴백.
        const birthDate = profile.birthDate || `${new Date().getFullYear()}-01-01`;

        setForm((prev) => ({
          ...prev,
          email: summary.email,
          name: profile.name,
          birthDate,
          // 서버는 연락처를 검증·정규화하지 않으므로(utils/phone.ts 주석 참고) 예전에 저장된
          // 값이 "01012345678" 같은 형태일 수 있다. 화면에 올릴 때 한 번 맞춰준다.
          contact: formatPhone(profile.phone ?? ''),
          gender: mapApiValueToGender(profile.gender),
          nationality: mapApiValueToNationality(profile.nationality),
          // region 은 객체로 온다. 시군구면 parentName 에 상위 시도가 실려 온다.
          region: profile.region?.parentName ?? profile.region?.name ?? '',
          sigungu: profile.region?.parentName ? profile.region.name : '',
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

  const selectedSido = form.region.trim();
  const selectedSidoId = regions.find(({ name }) => name === selectedSido)?.regionId;

  // 시도가 정해지면 그 시도의 시군구를 불러온다.
  useEffect(() => {
    if (!selectedSido || selectedSidoId === undefined) return;

    let isMounted = true;

    getRegionChildren(selectedSidoId)
      .then((response) => {
        if (!isMounted) return;
        setSigunguCache((prev) => ({ ...prev, [selectedSido]: response.data.data }));
      })
      .catch((err) => {
        if (!isMounted) return;
        // 실패를 조용히 넘기지 않는다. 빈 목록으로 두면 "원래 시군구가 없는 지역"(세종)과
        // 구분되지 않아, 사용자가 목록이 뜨기를 계속 기다리게 된다.
        console.error('시군구 목록 조회 실패:', err);
        setSigunguErrorByRegion((prev) => ({
          ...prev,
          [selectedSido]: '시군구 목록을 불러오지 못했어요. 시도만 선택해도 저장할 수 있어요.',
        }));
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSido, selectedSidoId]);

  // 지금 고른 시도의 것만 꺼내 쓴다. 시도가 바뀌면 자동으로 비워진다.
  const sigunguOptions = selectedSido ? (sigunguCache[selectedSido] ?? []) : [];
  const sigunguError = selectedSido ? (sigunguErrorByRegion[selectedSido] ?? null) : null;
  // 결과도 실패도 아직 안 들어왔으면 불러오는 중이다. 별도 state 없이 이걸로 판단한다.
  const isLoadingSigungu =
    !!selectedSido &&
    selectedSidoId !== undefined &&
    !(selectedSido in sigunguCache) &&
    !(selectedSido in sigunguErrorByRegion);

  // 시도가 바뀌면 이전 시군구는 무의미하므로 함께 비운다.
  const handleRegionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, region: e.target.value, sigungu: '' }));
  };

  const updateField =
    (field: keyof ProfileForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // 연락처는 회원가입(SignPage)과 동일하게, 입력하는 즉시 010-0000-0000 형태로 맞춰준다.
  // formatPhone이 숫자만 남기고 하이픈을 끼워 넣으므로 붙여넣기·국가번호(+82)도 흡수된다.
  const handleContactChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, contact: formatPhone(e.target.value) }));
  };

  const handleBack = () => {
    navigate('/mypage');
  };

  const handleSubmit = async () => {
    // 비밀번호 필드는 이제 선택 입력. 셋 중 하나라도 입력했을 때만
    // "비밀번호 변경 의사가 있다"고 보고, 그때만 세 값이 모두 채워졌는지 검증한다.
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

    // 연락처도 회원가입과 동일한 규칙으로 검사한다. 서버가 연락처를 검증하지 않으므로
    // (utils/phone.ts 주석) 여기서 막지 않으면 형식이 깨진 값이 그대로 저장된다.
    const phoneError = getPhoneError(form.contact);
    if (phoneError) {
      setSubmitError(phoneError);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 이 API는 연도만이 아니라 birthDate 필드에 "yyyy-MM-dd" 전체 날짜를 기대함.
      await putBasicProfile({
        name: form.name,
        birthDate: form.birthDate,
        phone: form.contact,
        gender: mapGenderToApiValue(form.gender),
        nationality: mapNationalityToApiValue(form.nationality),
        // 서버는 region 을 문자열 하나로만 받는다. 시군구를 골랐으면 "서울 중구" 로 합쳐 보낸다 —
        // RegionResolver 가 "시도 시군구" 조합을 가장 먼저 보므로 이 형태가 가장 정확하다.
        region: form.sigungu ? `${form.region} ${form.sigungu}` : form.region,
      });

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
      setSubmitError(
        extractApiErrorMessage(err, '저장에 실패했어요. 입력한 내용을 다시 확인해 주세요.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-left font-['Pretendard',sans-serif]">
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
            {/* 이메일 주소 — 이 화면에서는 조회만 가능, 수정 기능 없음 */}
            <div className="flex w-full flex-col items-start gap-2">
              <FieldLabel required>이메일 주소</FieldLabel>
              <TextInput
                type="email"
                value={form.email}
                onChange={updateField('email')}
                placeholder="이메일을 입력하세요"
                readOnly
              />
            </div>

            {/* 현재 비밀번호 / 새 비밀번호 / 새 비밀번호 확인 — 선택 입력 */}
            <div className="flex w-full flex-col items-start gap-2">
              <p className="text-[14px] font-medium leading-5 text-[#747883]">
                비밀번호를 바꾸고 싶을 때만 아래 세 항목을 모두 입력해 주세요.
              </p>
              <div className="flex w-full items-start gap-6">
                <div className="flex flex-1 flex-col items-start gap-2">
                  <FieldLabel>현재 비밀번호</FieldLabel>
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
                  <FieldLabel>새 비밀번호</FieldLabel>
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
                  <FieldLabel>새 비밀번호 확인</FieldLabel>
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
            </div>

            {/* 이름 / 생년월일 */}
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
                <FieldLabel required>생년월일</FieldLabel>
                {/* 네이티브 date input을 사용해 브라우저 기본 캘린더 UI로 선택 가능하게 함.
                    API도 birthDate 필드에 "yyyy-MM-dd" 전체 날짜를 그대로 기대하므로
                    별도 변환 없이 값을 그대로 주고받는다. */}
                <TextInput type="date" value={form.birthDate} onChange={updateField('birthDate')} />
              </div>
            </div>

            {/* 연락처 / 성별 */}
            <div className="flex w-full items-start gap-8">
              <div className="flex flex-1 flex-col items-start gap-2">
                <FieldLabel required>연락처</FieldLabel>
                <TextInput
                  type="tel"
                  value={form.contact}
                  onChange={handleContactChange}
                  inputMode="numeric"
                  maxLength={13}
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
                  {/* 시도와 시군구를 좌우로 둔다. 이 칸은 국적과 한 줄을 나눠 쓰고 있어
                      폭이 넉넉하지 않으므로 안내 문구는 짧게 쓴다. */}
                  <div className="flex w-full gap-2">
                    <div className="relative flex h-12 flex-1 items-center rounded-lg bg-[#F9FAFC]">
                      {/* select를 박스 전체(화살표 영역 포함)에 절대 위치로 깔아서, 화살표를
                          클릭해도 select 바깥이라 안 열리던 문제를 없앤다. 화살표 아이콘은
                          pointer-events-none이라 클릭이 바로 아래 select로 그대로 전달된다. */}
                      <select
                        value={form.region}
                        onChange={handleRegionChange}
                        disabled={isLoadingRegions || regions.length === 0}
                        className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-lg bg-transparent pl-6 pr-12 text-[16px] font-medium leading-6 text-[#555964] focus:outline-none disabled:cursor-default"
                      >
                        <option value="">{isLoadingRegions ? '불러오는 중...' : '시도'}</option>
                        {regions.map((region) => (
                          <option key={region.regionId} value={region.name}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-3 size-6 shrink-0 text-[#9DA1AC]" />
                    </div>

                    {/* 시군구. 선택 입력이라 안 골라도 저장된다(세종처럼 하위가 없는 시도도 있다). */}
                    <div className="relative flex h-12 flex-1 items-center rounded-lg bg-[#F9FAFC]">
                      <select
                        value={form.sigungu}
                        onChange={updateField('sigungu')}
                        disabled={!selectedSido || isLoadingSigungu || sigunguOptions.length === 0}
                        className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-lg bg-transparent pl-6 pr-12 text-[16px] font-medium leading-6 text-[#555964] focus:outline-none disabled:cursor-default"
                      >
                        <option value="">
                          {!selectedSido
                            ? '시도 먼저'
                            : isLoadingSigungu
                              ? '불러오는 중...'
                              : sigunguOptions.length === 0
                                ? '해당 없음'
                                : '시군구 (선택)'}
                        </option>
                        {sigunguOptions.map((item) => (
                          <option key={item.regionId} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-3 size-6 shrink-0 text-[#9DA1AC]" />
                    </div>
                  </div>

                  {sigunguError && (
                    <p className="text-[14px] font-medium leading-5 text-[#FA5862]">
                      {sigunguError}
                    </p>
                  )}
                  <p className="text-[14px] font-medium leading-5 text-[#747883]">
                    ※ 장학금 추천 시 거주 지역 기준이 활용될 수 있어요.
                  </p>
                  {regionLoadError && (
                    <p className="text-[14px] font-medium leading-5 text-[#FA5862]">
                      {regionLoadError}
                    </p>
                  )}
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
