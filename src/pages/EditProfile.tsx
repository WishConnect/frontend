import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
  type InputHTMLAttributes,
  type ChangeEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { putBasicProfile, getMyProfile } from '../api/onboarding/profile';
import { updatePassword, getMyPageSummary } from '../api/mypage/mypage';
import { useUserStore } from '../store/user/user';
import { tokenStorage } from '../utils/token';
import { formatPhone, getPhoneError } from '../utils/phone';
import { getRegions, getSigunguList } from '../api/common/region';

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
  gender: Gender;
  nationality: Nationality;
  // 거주 지역은 시도 + 시군구 2단계다. 서버로는 "서울 중구" 처럼 한 문자열로 합쳐 보낸다
  // (ProfileBasicRequest.region 이 String 하나뿐이라 필드를 나눠 보낼 수 없다).
  region: string; // 시도. 예: "서울"
  sigungu: string; // 시군구. 예: "중구". 세종처럼 하위가 없으면 빈 문자열
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

// ------------------------------------------------------------------
// 거주 지역 선택지 대체본(17개 시도). 회원가입(SignPage)과 동일하게 평소엔
// GET /regions 로 서버 마스터를 받아 쓰고, 그 호출이 실패했을 때만 이 목록을 쓴다.
//
// SignPage의 대체본은 정식 명칭("서울특별시")이지만 여기선 서버와 같은 축약형을 쓴다.
// 프로필 조회 응답의 region이 "서울" 같은 축약형으로 오기 때문에, 대체본이 정식 명칭이면
// 이미 저장된 값이 목록에 없는 것으로 잡혀 저장이 막힌다.
// ------------------------------------------------------------------
const REGION_FALLBACK_OPTIONS: string[] = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];

// 지금은 하드코딩된 기본값이지만, 추후 로그인/API 응답으로 이 객체를 채우면 됩니다.
const DEFAULT_FORM: ProfileForm = {
  email: 'wishconnect@gmail.com',
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
  name: '김위시',
  birthDate: '2004-01-01',
  contact: '',
  gender: 'female',
  nationality: 'domestic',
  // 미선택 상태. 예전엔 '서울'이 기본값이라, 거주지역을 고른 적 없는 계정도
  // 화면엔 서울이 선택된 것처럼 보이고 그대로 저장되는 문제가 있었다.
  region: '',
  sigungu: '',
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
  // 거주 지역 자동완성. 회원가입(SignPage)과 같은 방식으로, 서버 목록을 마운트 때 한 번
  // 받아두고 입력값으로 좁혀 보여준다. 조회에 실패하면 대체 목록으로 계속 쓴다.
  const [regionOptions, setRegionOptions] = useState<string[]>(REGION_FALLBACK_OPTIONS);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const regionBoxRef = useRef<HTMLDivElement>(null);
  // 시도 이름 → regionId. 시군구 조회에 regionId 가 필요한데, 대체 목록으로 떨어지면
  // id 를 알 수 없으므로 비어 있게 된다(그때는 시군구를 못 고른다).
  const [regionIdByName, setRegionIdByName] = useState<Record<string, number>>({});
  // 시군구. 시도 이름을 키로 캐시한다(아래 effect 주석 참고).
  const [sigunguCache, setSigunguCache] = useState<Record<string, string[]>>({});
  const [sigunguErrorBySido, setSigunguErrorBySido] = useState<Record<string, string>>({});
  const [showSigunguDropdown, setShowSigunguDropdown] = useState(false);
  const sigunguBoxRef = useRef<HTMLDivElement>(null);
  const clearUser = useUserStore((s) => s.clearUser);

  // 거주 지역 목록 조회. 실패해도 화면을 막지 않고 대체 목록을 그대로 쓴다.
  useEffect(() => {
    let isMounted = true;

    getRegions()
      .then((regions) => {
        if (isMounted && regions.length > 0) {
          setRegionOptions(regions.map((item) => item.name));
          setRegionIdByName(Object.fromEntries(regions.map((item) => [item.name, item.regionId])));
        }
      })
      .catch((error) => {
        console.error('거주 지역 목록 조회 실패:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 입력한 글자가 포함된 지역만 남긴다. 비어 있으면 전체를 보여준다.
  const filteredRegions = useMemo(() => {
    const keyword = form.region.trim();
    if (!keyword) return regionOptions;
    return regionOptions.filter((name) => name.includes(keyword));
  }, [form.region, regionOptions]);

  const selectedSido = form.region.trim();
  const selectedSidoId = regionIdByName[selectedSido];

  // 시도가 정해지면 그 시도의 시군구를 불러온다. 결과는 시도 이름을 키로 캐시에 넣는다.
  //
  // 캐시로 두는 이유: 시도를 바꿨을 때 이전 시도의 시군구가 남아 보이면 안 되는데,
  // effect 안에서 동기적으로 비우면 렌더가 한 번 더 돌고 린트 규칙에도 걸린다
  // (react-hooks/set-state-in-effect). 키로 꺼내 쓰면 그 문제가 둘 다 사라지고,
  // 시도를 왔다 갔다 해도 다시 부르지 않는다.
  useEffect(() => {
    if (!selectedSido || selectedSidoId === undefined) return;

    let isMounted = true;

    getSigunguList(selectedSidoId)
      .then((items) => {
        if (!isMounted) return;
        setSigunguCache((prev) => ({ ...prev, [selectedSido]: items.map((item) => item.name) }));
      })
      .catch((error) => {
        if (!isMounted) return;
        // 실패를 조용히 넘기지 않는다. 이 엔드포인트는 2026-08-19 기준 배포 서버에서 전 시도
        // 500 이 나는 상태라, console 로만 남기면 "원래 시군구가 없는 지역"과 구분되지 않는다.
        console.error('시군구 목록 조회 실패:', error);
        setSigunguErrorBySido((prev) => ({
          ...prev,
          [selectedSido]: `시군구 목록을 불러오지 못했어요. (GET /regions/${selectedSidoId}/children — ${extractApiErrorMessage(error, '원인 불명')})`,
        }));
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSido, selectedSidoId]);

  // 지금 고른 시도의 것만 꺼내 쓴다. 시도가 바뀌면 자동으로 비워진다.
  const sigunguOptions = useMemo(
    () => (selectedSido ? (sigunguCache[selectedSido] ?? []) : []),
    [selectedSido, sigunguCache],
  );

  const sigunguError = !selectedSido
    ? null
    : selectedSidoId === undefined
      ? // 시도 목록 조회가 실패해 대체 목록을 쓰는 중이면 regionId 를 모른다.
        '지역 목록을 불러오지 못해 시군구를 선택할 수 없어요.'
      : (sigunguErrorBySido[selectedSido] ?? null);

  // 결과도 실패도 아직 안 들어왔으면 불러오는 중이다. 별도 state 없이 이걸로 판단한다.
  const isLoadingSigungu =
    !!selectedSido &&
    selectedSidoId !== undefined &&
    !(selectedSido in sigunguCache) &&
    !(selectedSido in sigunguErrorBySido);

  // 입력한 글자가 포함된 시군구만 남긴다.
  const filteredSigungu = useMemo(() => {
    const keyword = form.sigungu.trim();
    if (!keyword) return sigunguOptions;
    return sigunguOptions.filter((name) => name.includes(keyword));
  }, [form.sigungu, sigunguOptions]);

  // 목록 바깥을 누르면 닫는다. 열려 있을 때만 리스너를 건다.
  useEffect(() => {
    if (!showRegionDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!regionBoxRef.current?.contains(e.target as Node)) {
        setShowRegionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRegionDropdown]);

  useEffect(() => {
    if (!showSigunguDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!sigunguBoxRef.current?.contains(e.target as Node)) {
        setShowSigunguDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSigunguDropdown]);

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
          // 서버가 준 값을 그대로 쓴다. 저장된 지역이 없으면(null) 임의의 지역으로 채우지 않고
          // 비워 둔다 - 사용자가 직접 고르게 하는 편이 안전하다.
          //
          // region 은 2026-08-19부터 객체로 온다. 시군구면 parentName 에 상위 시도가 실려 오므로
          // 어느 시도의 "중구"인지 그대로 알 수 있다(예전엔 이름만 와서 복원이 불가능했다).
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

    // 거주 지역도 자유 입력이라 오타가 그대로 넘어갈 수 있다. 서버는 이름으로 지역 테이블을
    // 찾는데, 프로필 저장(PUT)은 못 찾으면 400 INVALID_REGION 을 던진다(UserProfileService.getRegion).
    // 회원가입(POST /auth/signup)은 같은 상황에서 조용히 null 로 저장하므로 동작이 서로 다르다.
    // 어느 쪽이든 여기서 걸러야 사용자가 이유를 알 수 있어 목록에 있는 값만 통과시킨다.
    if (!form.region.trim()) {
      setSubmitError('거주 지역을 선택해 주세요.');
      return;
    }
    if (!regionOptions.includes(form.region.trim())) {
      setSubmitError('거주 지역은 목록에서 선택해 주세요.');
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
        // 서버는 region 을 문자열 하나로만 받는다. 시군구를 골랐으면 "서울 중구" 로 합쳐 보낸다.
        // RegionResolver 가 "시도 시군구" 조합을 먼저 보므로 이 형태가 가장 정확하다.
        region: form.sigungu.trim() ? `${form.region.trim()} ${form.sigungu.trim()}` : form.region.trim(),
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
                {/* 숫자만 받고 하이픈은 자동으로 넣는다(010-1234-5678).
                    하이픈을 직접 치거나 통째로 붙여넣어도 같은 표기로 정리된다. */}
                <TextInput
                  type="tel"
                  value={form.contact}
                  onChange={handleContactChange}
                  placeholder="010-0000-0000"
                  inputMode="numeric"
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
                  {/* 회원가입(SignPage)과 같은 방식: 입력하면 서버에서 받은 지역 목록이 좁혀진다.
                      자유 입력이라 오타가 나면 저장이 안 되므로, 제출 때 목록에 있는 값인지 확인한다. */}
                  {/* 시도와 시군구를 좌우로 둔다(회원가입 화면과 동일). 이 칸은 국적과 한 줄을
                      나눠 쓰고 있어 폭이 넉넉하지 않으므로, 안내 문구는 짧게 쓴다. */}
                  <div className="flex w-full gap-2">
                    <div className="relative flex-1" ref={regionBoxRef}>
                      <div className="flex h-12 w-full items-center rounded-lg bg-[#F9FAFC] pl-6 pr-3">
                        <input
                          value={form.region}
                          onChange={(e) => {
                            setForm((prev) => ({ ...prev, region: e.target.value }));
                            setShowRegionDropdown(true);
                          }}
                          onFocus={() => setShowRegionDropdown(true)}
                          placeholder="시도"
                          className="w-full flex-1 bg-transparent text-[16px] font-medium leading-6 text-[#555964] placeholder:text-[#9DA1AC] focus:outline-none"
                        />
                        <ChevronDownIcon className="pointer-events-none size-6 shrink-0 text-[#9DA1AC]" />
                      </div>
                      {/* 높이는 시도 17개가 최대라 400px(약 8개)까지 열어두고 나머지는 스크롤 */}
                      {showRegionDropdown && filteredRegions.length > 0 && (
                        <ul className="absolute left-0 top-[calc(100%+4px)] z-20 max-h-[400px] w-full overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white py-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                          {filteredRegions.map((name) => (
                            <li key={name}>
                              <button
                                type="button"
                                className={`w-full px-6 py-3 text-left text-[16px] font-medium leading-6 hover:bg-[#F4F4FE] ${
                                  name === form.region.trim()
                                    ? 'bg-[#F4F4FE] text-[#7962ED]'
                                    : 'text-[#0A0C11]'
                                }`}
                                onClick={() => {
                                  // 시도가 바뀌면 이전 시군구는 무의미하므로 비운다.
                                  setForm((prev) => ({ ...prev, region: name, sigungu: '' }));
                                  setShowRegionDropdown(false);
                                }}
                              >
                                {name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {/* 시군구. 시도를 고른 뒤에만 의미가 있어 그때 활성화한다. */}
                    <div className="relative flex-1" ref={sigunguBoxRef}>
                      <div className="flex h-12 w-full items-center rounded-lg bg-[#F9FAFC] pl-6 pr-3">
                        <input
                          value={form.sigungu}
                          disabled={!form.region.trim() || isLoadingSigungu}
                          onChange={(e) => {
                            setForm((prev) => ({ ...prev, sigungu: e.target.value }));
                            setShowSigunguDropdown(true);
                          }}
                          onFocus={() => setShowSigunguDropdown(true)}
                          placeholder={
                            !form.region.trim()
                              ? '시도 먼저'
                              : isLoadingSigungu
                                ? '불러오는 중…'
                                : sigunguOptions.length === 0
                                  ? '해당 없음'
                                  : '시군구 (선택)'
                          }
                          className="w-full flex-1 bg-transparent text-[16px] font-medium leading-6 text-[#555964] placeholder:text-[#9DA1AC] focus:outline-none disabled:cursor-not-allowed"
                        />
                        <ChevronDownIcon className="pointer-events-none size-6 shrink-0 text-[#9DA1AC]" />
                      </div>
                      {showSigunguDropdown && filteredSigungu.length > 0 && (
                        <ul className="absolute left-0 top-[calc(100%+4px)] z-20 max-h-[400px] w-full overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white py-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                          {filteredSigungu.map((name) => (
                            <li key={name}>
                              <button
                                type="button"
                                className={`w-full px-6 py-3 text-left text-[16px] font-medium leading-6 hover:bg-[#F4F4FE] ${
                                  name === form.sigungu.trim()
                                    ? 'bg-[#F4F4FE] text-[#7962ED]'
                                    : 'text-[#0A0C11]'
                                }`}
                                onClick={() => {
                                  setForm((prev) => ({ ...prev, sigungu: name }));
                                  setShowSigunguDropdown(false);
                                }}
                              >
                                {name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* 시군구 조회 실패 사유. 콘솔에만 남기면 "원래 없는 지역"과 구분이 안 된다. */}
                  {sigunguError && (
                    <p className="text-[14px] font-medium leading-5 text-[#FA5862]">
                      {sigunguError}
                    </p>
                  )}

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
