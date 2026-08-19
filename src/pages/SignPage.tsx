import { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../components/common/Header/Header';
import TextField1 from '../components/TextField1';
import Button from '../components/Button/Button';
import Select from '../components/Select';
import SelectDropdown from '../components/common/SelectDropdown';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api/login/signup';
import {
  formatRemainingTime,
  useEmailVerification,
  type StatusMessage,
} from '../hooks/useEmailVerification';
import { getApiErrorMessage } from '../utils/apiError';
import { getPasswordError } from '../utils/password';
import { getLoginIdError, normalizeLoginId, LOGIN_ID_RULE_TEXT } from '../utils/loginId';
import { formatPhone, getPhoneError } from '../utils/phone';
import { checkLoginIdAvailable } from '../api/login/loginId';
import { getRegions, getRegionChildren } from '../api/region';
import { tokenStorage } from '../utils/token';
import { useUserStore } from '../store/user/user';
import type {
  AgreementType,
  Gender as ApiGender,
  Nationality as ApiNationality,
} from '../types/login/auth';

type Gender = '여성' | '남성' | '선택 안함';
type Nationality = '내국인' | '외국인';

// 화면에 보이는 한글 선택지를 백엔드 enum 값으로 바꾸는 표.
const GENDER_TO_API: Record<Gender, ApiGender> = {
  여성: 'FEMALE',
  남성: 'MALE',
  '선택 안함': 'NONE',
};
const NATIONALITY_TO_API: Record<Nationality, ApiNationality> = {
  내국인: 'DOMESTIC',
  외국인: 'FOREIGN',
};
// 약관 체크박스 id → 백엔드 AgreementType
//
// id 3(THIRD_PARTY, 개인정보 제3자 제공 동의)은 제외했다. 실제로 외부에 정보를 넘기지
// 않으면 받을 이유가 없는 동의라서다. 번호는 일부러 3을 비워두고 4를 그대로 뒀다 —
// 되살릴 일이 생기면 항목만 다시 넣으면 되고, 기존 가입자 동의 이력의 id 와도 어긋나지 않는다.
const AGREEMENT_TYPE_BY_ID: Record<number, AgreementType> = {
  1: 'TERMS',
  2: 'PRIVACY',
  4: 'AGE_14',
};

// 생년월일 선택지. 백엔드가 birthYear(연도)에서 birthDate(날짜)로 바뀌어 연·월·일을 다 받는다.
//
// 만 14세 이상만 가입할 수 있으므로(약관 필수 동의 항목), 고를 수 있는 가장 늦은 생일은
// "오늘로부터 14년 전의 같은 날짜"다. 연도만 받던 시절엔 올해-14년까지 열어두는 게 최선이었지만,
// 이제 날짜를 받으니 그 해의 생일이 지났는지까지 정확히 가른다.
// (예: 오늘이 2026-08-17이면 2012-08-17까지 가능, 2012-08-18 이후는 아직 만 13세)
const TODAY = new Date();
const MAX_BIRTH_YEAR = TODAY.getFullYear() - 14;
const MAX_BIRTH_MONTH = TODAY.getMonth() + 1; // getMonth()는 0부터라 +1
const MAX_BIRTH_DAY = TODAY.getDate();

const BIRTH_YEAR_OPTIONS = Array.from(
  { length: MAX_BIRTH_YEAR - 1950 + 1 },
  (_, index) => `${MAX_BIRTH_YEAR - index}년`,
);

// 가입 가능 연령 안내. 경계에 걸린 사람이 "왜 이 달은 없지?" 하지 않도록 문구로 알려준다.
const BIRTH_DATE_RULE_TEXT = `※ 만 14세 이상만 가입할 수 있어요.`;

// 제출 직전 한 번 더 비교할 기준값. 'YYYY-MM-DD'는 사전순이 곧 날짜순이라 문자열 비교로 충분하다.
const MAX_BIRTH_DATE = `${MAX_BIRTH_YEAR}-${String(MAX_BIRTH_MONTH).padStart(2, '0')}-${String(MAX_BIRTH_DAY).padStart(2, '0')}`;

// "2004년" → 2004 처럼 뒤에 붙은 단위를 떼고 숫자만 꺼낸다.
function toNumber(option: string): number {
  return Number.parseInt(option, 10);
}

// 그 달의 마지막 날. Date의 day에 0을 주면 "전달의 마지막 날"이 나오는 성질을 쓴다.
// 윤년(2월 29일)도 이 계산이 알아서 처리한다.
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// 거주 지역 선택지 대체본(17개 시도).
// 평소엔 GET /regions 로 서버 마스터를 받아 쓰고, 그 호출이 실패했을 때만 이 목록을 쓴다.
// 지역을 못 고르면 가입 자체가 막히므로 빈 목록으로 두지 않는다.
// 백엔드가 "서울특별시"→"서울"로 바꿔서 조회하므로(normalizeRegionName) 정식 명칭이어도 저장된다.
const REGION_FALLBACK_OPTIONS = [
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

// 안내문구 색상: 일반 안내(회색) / 확인 완료(보라, 시안 1457:4958) / 성공(초록) / 실패(빨강)
const MESSAGE_TONE_CLASS: Record<StatusMessage['tone'], string> = {
  info: 'text-[#747883]',
  brand: 'text-[#7962ED]',
  success: 'text-[#00BF8A]',
  error: 'text-[#FF4D4F]',
};

// 시안의 􀆅 자리. SF Symbols라 그대로 못 쓰고 같은 모양의 인라인 SVG로 대체했다.
// 색은 stroke="currentColor"라 문구 색(MESSAGE_TONE_CLASS)을 그대로 따라간다.
function CheckMarkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M2.5 7.5L5.5 10.5L11.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 입력창 아래 안내 한 줄. 상태 문구(색·체크표시)와 기본 안내문구를 한 곳에서 처리한다.
 * 아이디·이메일·인증코드 세 곳이 같은 모양이라 컴포넌트로 묶었다.
 */
function StatusLine({ message, fallback }: { message: StatusMessage | null; fallback: string }) {
  return (
    <div
      className={`flex items-center gap-[4px] text-[14px] font-[500] ${message ? MESSAGE_TONE_CLASS[message.tone] : 'text-[#747883]'}`}
    >
      {message?.icon === 'check' && <CheckMarkIcon />}
      <span>{message?.text ?? fallback}</span>
    </div>
  );
}

// 약관 동의 체크박스 아이콘.
// 원래 SignPage 안(렌더 함수 내부)에 선언돼 있었는데, 그러면 렌더할 때마다 새 컴포넌트로 취급돼
// 리렌더 비용이 커지고 lint(react-hooks)도 막아서 바깥으로 뺐다. 모양은 그대로.
function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 cursor-pointer"
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="6"
        fill={checked ? '#7962ED' : '#FFFFFF'}
        stroke={checked ? '#7962ED' : '#D2D4DA'}
        strokeWidth="1.5"
      />
      {checked && (
        <path
          d="M7.5 12L10.5 15L16.5 9"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// 비밀번호 표시/숨김 토글에 쓰는 눈 아이콘. 숨김 상태일 땐 사선을 덧그린다.
function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.5938 13.2812C9.5625 13.2812 8.58594 13.1562 7.66406 12.9062C6.74219 12.6562 5.88802 12.3255 5.10156 11.9141C4.3151 11.5026 3.60677 11.0495 2.97656 10.5547C2.35156 10.0547 1.8151 9.55729 1.36719 9.0625C0.924479 8.5625 0.585938 8.09896 0.351562 7.67188C0.117188 7.24479 0 6.90104 0 6.64062C0 6.375 0.117188 6.03125 0.351562 5.60938C0.585938 5.18229 0.924479 4.71875 1.36719 4.21875C1.8151 3.71875 2.35156 3.22135 2.97656 2.72656C3.60677 2.23177 4.3151 1.77865 5.10156 1.36719C5.88802 0.955729 6.74219 0.625 7.66406 0.375C8.58594 0.125 9.5625 0 10.5938 0C11.6354 0 12.6172 0.125 13.5391 0.375C14.4661 0.625 15.3229 0.955729 16.1094 1.36719C16.8958 1.77865 17.6016 2.23177 18.2266 2.72656C18.8516 3.22135 19.3828 3.71875 19.8203 4.21875C20.263 4.71875 20.599 5.18229 20.8281 5.60938C21.0625 6.03125 21.1797 6.375 21.1797 6.64062C21.1797 6.90104 21.0625 7.24479 20.8281 7.67188C20.599 8.09896 20.263 8.5625 19.8203 9.0625C19.3828 9.55729 18.8516 10.0547 18.2266 10.5547C17.6068 11.0495 16.9036 11.5026 16.1172 11.9141C15.3307 12.3255 14.474 12.6562 13.5469 12.9062C12.6198 13.1562 11.6354 13.2812 10.5938 13.2812ZM10.5938 11.0078C11.1927 11.0078 11.7552 10.8958 12.2812 10.6719C12.8125 10.4427 13.2786 10.1276 13.6797 9.72656C14.0807 9.32552 14.3932 8.86198 14.6172 8.33594C14.8464 7.8099 14.9609 7.24479 14.9609 6.64062C14.9609 6.03646 14.8464 5.47135 14.6172 4.94531C14.3932 4.41927 14.0807 3.95573 13.6797 3.55469C13.2786 3.15365 12.8125 2.84115 12.2812 2.61719C11.7552 2.38802 11.1927 2.27344 10.5938 2.27344C9.98958 2.27344 9.42448 2.38802 8.89844 2.61719C8.3724 2.84115 7.90885 3.15365 7.50781 3.55469C7.10677 3.95573 6.79167 4.41927 6.5625 4.94531C6.33854 5.47135 6.22656 6.03646 6.22656 6.64062C6.22656 7.24479 6.33854 7.8099 6.5625 8.33594C6.79167 8.86198 7.10677 9.32552 7.50781 9.72656C7.90885 10.1276 8.3724 10.4427 8.89844 10.6719C9.42448 10.8958 9.98958 11.0078 10.5938 11.0078ZM10.5938 8.23438C10.151 8.23438 9.77344 8.08073 9.46094 7.77344C9.15365 7.46094 9 7.08333 9 6.64062C9 6.19792 9.15365 5.82292 9.46094 5.51562C9.77344 5.20312 10.151 5.04688 10.5938 5.04688C11.0312 5.04688 11.4062 5.20312 11.7188 5.51562C12.0312 5.82292 12.1875 6.19792 12.1875 6.64062C12.1875 7.08333 12.0312 7.46094 11.7188 7.77344C11.4062 8.08073 11.0312 8.23438 10.5938 8.23438Z"
        fill="#9DA1AC"
      />
      {!visible && <path d="M1 1L21 13" stroke="#9DA1AC" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}

export default function SignPage() {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  // 입력값
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [region, setRegion] = useState('');
  const [sigungu, setSigungu] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [nationality, setNationality] = useState<Nationality | null>(null);

  // 거주 지역 자동완성. 서버 목록(GET /regions)을 마운트 때 한 번 받아두고,
  // 입력할 때마다 그 안에서 걸러 보여준다. 전공명 검색과 달리 항목이 17개뿐이라
  // 글자마다 서버를 부를 이유가 없어 요청은 1회, 필터는 화면에서 한다.
  const [regionOptions, setRegionOptions] = useState<string[]>(REGION_FALLBACK_OPTIONS);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const regionBoxRef = useRef<HTMLDivElement>(null);

  // 시군구(2단계). 시도 이름 → regionId 를 알아야 GET /regions/{id}/children 을 부를 수 있는데,
  // 시도 목록 조회가 실패해 대체 목록을 쓰는 중이면 id 를 모른다(그때는 시군구를 못 고른다).
  // 결과와 실패 사유는 시도 이름을 키로 캐시한다 — 시도를 바꿨을 때 이전 시군구가 남아 보이지 않고,
  // effect 안에서 동기적으로 비울 필요가 없어 렌더가 한 번 덜 돈다.
  const [regionIdByName, setRegionIdByName] = useState<Record<string, number>>({});
  const [sigunguCache, setSigunguCache] = useState<Record<string, string[]>>({});
  const [sigunguErrorBySido, setSigunguErrorBySido] = useState<Record<string, string>>({});
  const [showSigunguDropdown, setShowSigunguDropdown] = useState(false);
  const sigunguBoxRef = useRef<HTMLDivElement>(null);

  // 비밀번호 표시 여부
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // 제출 상태
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 아이디 중복확인 상태. 이메일과 달리 인증 단계가 없어서 훅 없이 여기서 관리한다.
  const [isLoginIdChecked, setIsLoginIdChecked] = useState(false);
  const [isCheckingLoginId, setIsCheckingLoginId] = useState(false);
  const [loginIdMessage, setLoginIdMessage] = useState<StatusMessage | null>(null);

  // 이메일 인증(중복확인 → 코드발송 → 코드확인) 상태와 동작
  const verification = useEmailVerification(email);

  // 거주 지역 목록 조회. 실패해도 화면을 막지 않고 대체 목록(REGION_FALLBACK_OPTIONS)을 그대로 쓴다.
  useEffect(() => {
    let isMounted = true;

    getRegions()
      .then((response) => {
        const regions = response.data.data;
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

  // 월 선택지. 가입 가능한 마지막 해(올해-14년)를 고른 경우엔 생일이 지난 달까지만 열어둔다.
  // 그 위 연도는 이미 만 14세가 넘으므로 12개월 전부 고를 수 있다.
  const birthMonthOptions = useMemo(() => {
    const lastMonth = toNumber(birthYear) === MAX_BIRTH_YEAR ? MAX_BIRTH_MONTH : 12;
    return Array.from({ length: lastMonth }, (_, index) => `${index + 1}월`);
  }, [birthYear]);

  // 일(日) 선택지는 연·월에 따라 달라진다(2월 28/29일, 30일까지인 달).
  // 연도나 월을 아직 안 골랐으면 31일까지 보여주고, 고르는 순간 실제 말일로 좁힌다.
  // 경계가 되는 해·달(예: 2012년 8월)이면 오늘 날짜까지만 — 그 뒤는 아직 만 14세가 안 됐다.
  const birthDayOptions = useMemo(() => {
    const year = birthYear ? toNumber(birthYear) : null;
    const month = birthMonth ? toNumber(birthMonth) : null;
    let lastDay = year && month ? getDaysInMonth(year, month) : 31;
    if (year === MAX_BIRTH_YEAR && month === MAX_BIRTH_MONTH) {
      lastDay = Math.min(lastDay, MAX_BIRTH_DAY);
    }
    return Array.from({ length: lastDay }, (_, index) => `${index + 1}일`);
  }, [birthYear, birthMonth]);

  // 이미 고른 값이 목록에서 사라지는 경우를 정리한다.
  //   - 3월 31일을 고른 뒤 월을 2월로 → 일 비움
  //   - 2005년 12월을 고른 뒤 연도를 경계 연도(예: 2012년)로 → 월·일 비움
  // 안 지우면 화면엔 12월이 보이는데 목록엔 없는, 실제로 못 고를 값이 남는다.
  useEffect(() => {
    if (birthMonth && !birthMonthOptions.includes(birthMonth)) {
      setBirthMonth('');
      setBirthDay('');
      return;
    }
    if (birthDay && !birthDayOptions.includes(birthDay)) {
      setBirthDay('');
    }
  }, [birthMonth, birthMonthOptions, birthDay, birthDayOptions]);

  // 서버에 보낼 생년월일. 셋 다 골랐을 때만 'YYYY-MM-DD'로 만든다(백엔드 LocalDate 형식).
  const birthDate = useMemo(() => {
    if (!birthYear || !birthMonth || !birthDay) return '';
    const year = toNumber(birthYear);
    const month = String(toNumber(birthMonth)).padStart(2, '0');
    const day = String(toNumber(birthDay)).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [birthYear, birthMonth, birthDay]);

  // 입력한 글자가 들어간 지역만 남긴다. 아무것도 안 쳤으면 전체를 보여준다(드롭다운처럼 쓰라고).
  const filteredRegions = useMemo(() => {
    const keyword = region.trim();
    if (!keyword) return regionOptions;
    return regionOptions.filter((name) => name.includes(keyword));
  }, [region, regionOptions]);

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

  const selectedSido = region.trim();
  const selectedSidoId = regionIdByName[selectedSido];

  // 시도가 정해지면 그 시도의 시군구를 불러온다.
  useEffect(() => {
    if (!selectedSido || selectedSidoId === undefined) return;

    let isMounted = true;

    getRegionChildren(selectedSidoId)
      .then((response) => {
        if (!isMounted) return;
        setSigunguCache((prev) => ({
          ...prev,
          [selectedSido]: response.data.data.map((item) => item.name),
        }));
      })
      .catch((error) => {
        if (!isMounted) return;
        // 실패를 조용히 넘기지 않는다. 이 엔드포인트는 2026-08-19 기준 배포 서버에서
        // 전 시도 500 이 나는 상태라, console 로만 남기면 "원래 시군구가 없는 지역"과
        // 구분되지 않아 사용자가 계속 기다리게 된다.
        console.error('시군구 목록 조회 실패:', error);
        setSigunguErrorBySido((prev) => ({
          ...prev,
          [selectedSido]: '시군구 목록을 불러오지 못했어요. 시도만 선택해도 가입할 수 있어요.',
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
      ? '지역 목록을 불러오지 못해 시군구를 선택할 수 없어요. 시도만 선택해도 가입할 수 있어요.'
      : (sigunguErrorBySido[selectedSido] ?? null);

  // 결과도 실패도 아직 안 들어왔으면 불러오는 중이다. 별도 state 없이 이걸로 판단한다.
  const isLoadingSigungu =
    !!selectedSido &&
    selectedSidoId !== undefined &&
    !(selectedSido in sigunguCache) &&
    !(selectedSido in sigunguErrorBySido);

  const filteredSigungu = useMemo(() => {
    const keyword = sigungu.trim();
    if (!keyword) return sigunguOptions;
    return sigunguOptions.filter((name) => name.includes(keyword));
  }, [sigungu, sigunguOptions]);

  // 아이디를 고치면 이전 중복확인 결과를 반드시 무효화한다.
  // 안 그러면 A로 확인받고 B로 바꿔 제출하는 우회가 생겨, 서버가 다시 막지 않으면 중복이 통과한다.
  const handleLoginIdChange = (value: string) => {
    setLoginId(value);
    setIsLoginIdChecked(false);
    setLoginIdMessage(null);
  };

  const handleLoginIdCheck = async () => {
    const ruleError = getLoginIdError(loginId);
    if (ruleError) {
      setLoginIdMessage({ text: ruleError, tone: 'error' });
      return;
    }

    setIsCheckingLoginId(true);
    try {
      const available = await checkLoginIdAvailable(loginId);
      if (available) {
        setIsLoginIdChecked(true);
        // 이메일 쪽 "사용할 수 있는 이메일이에요."와 같은 모양(보라 + 체크)으로 맞춘다.
        setLoginIdMessage({ text: '사용할 수 있는 아이디예요.', tone: 'brand', icon: 'check' });
      } else {
        setIsLoginIdChecked(false);
        setLoginIdMessage({ text: '이미 사용 중인 아이디예요.', tone: 'error' });
      }
    } catch (error) {
      setIsLoginIdChecked(false);
      setLoginIdMessage({
        text: getApiErrorMessage(error, '아이디 확인에 실패했어요. 잠시 후 다시 시도해 주세요.'),
        tone: 'error',
      });
    } finally {
      setIsCheckingLoginId(false);
    }
  };

  // 비어 있거나 조회 중일 때만 잠근다.
  // 한 번 확인했다고 잠그지 않는 이유: 이메일과 달리 아이디는 인증 절차가 없어서 되돌릴 방법이 없다.
  // 확인 후 마음이 바뀌어 다른 아이디를 넣어보는 건 흔한 일이고, 몇 번을 눌러도 GET 조회라 부담도 없다.
  // 규칙 위반은 버튼을 막지 않고 눌렀을 때 사유를 알려준다(버튼이 왜 안 눌리는지 모르는 것보다 낫다).
  const isLoginIdButtonDisabled = !loginId.trim() || isCheckingLoginId;

  const terms = [
    { id: 1, text: '[필수] 이용약관 동의' },
    { id: 2, text: '[필수] 개인 정보 수집 및 이용 동의' },
    { id: 4, text: '[필수] 만 14세 이상입니다.' },
  ];
  const [agreements, setAgreements] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    4: false,
  });

  const isAllAgreed = terms.every((term) => agreements[term.id]);

  const handleAgreeAll = () => {
    const newValue = !isAllAgreed;
    setAgreements({ 1: newValue, 2: newValue, 4: newValue });
  };

  const handleAgree = (id: number) => {
    setAgreements((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isAllRequiredAgreed = terms
    .filter((term) => term.text.includes('[필수]'))
    .every((term) => agreements[term.id]);

  // 이메일 오른쪽 버튼은 단계에 따라 역할이 바뀐다: 중복 확인 → 인증코드 발송 → 재발송.
  const emailButtonLabel = (() => {
    if (verification.step === 'idle') return '중복 확인';
    if (verification.step === 'available') return '인증코드 발송';
    if (verification.step === 'verified') return '인증 완료';
    return verification.resendCooldown > 0 ? `재발송 ${verification.resendCooldown}초` : '재발송';
  })();

  const isEmailButtonDisabled =
    !email.trim() ||
    verification.isLoading ||
    verification.step === 'verified' ||
    (verification.step === 'sent' && verification.resendCooldown > 0);

  const handleEmailButtonClick = () => {
    // 아직 중복 확인 전이면 중복 확인부터, 그 뒤로는 코드 발송/재발송.
    if (verification.step === 'idle') {
      verification.checkEmail();
    } else {
      verification.sendCode();
    }
  };

  // 회원가입 제출: 화면에서 먼저 걸러낸 뒤 API 호출 → 토큰·유저 저장 → 온보딩으로 이동
  const handleSubmit = async () => {
    setSubmitError('');

    // 아이디는 화면 순서상 맨 위라 검증도 먼저 한다.
    const loginIdError = getLoginIdError(loginId);
    if (loginIdError) {
      setSubmitError(loginIdError);
      return;
    }
    if (!isLoginIdChecked) {
      setSubmitError('아이디 중복 확인을 먼저 해주세요.');
      return;
    }
    if (!verification.isVerified) {
      setSubmitError('이메일 인증을 먼저 완료해 주세요.');
      return;
    }
    const passwordError = getPasswordError(password, email);
    if (passwordError) {
      setSubmitError(passwordError);
      return;
    }
    if (password !== passwordConfirm) {
      setSubmitError('비밀번호가 서로 일치하지 않습니다.');
      return;
    }
    if (!name.trim()) {
      setSubmitError('이름을 입력해 주세요.');
      return;
    }
    // 연·월·일 중 하나라도 비면 birthDate가 만들어지지 않는다.
    if (!birthDate) {
      setSubmitError('생년월일을 선택해 주세요.');
      return;
    }
    // 목록에서 이미 막고 있지만, 자정을 넘겨 기준일이 하루 밀리는 경우까지 생각해 한 번 더 본다.
    if (birthDate > MAX_BIRTH_DATE) {
      setSubmitError('만 14세 이상만 가입할 수 있어요.');
      return;
    }
    // 서버가 연락처를 검증하지 않으므로(@NotBlank뿐) 형식은 여기서 걸러야 한다.
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
    if (!region.trim()) {
      setSubmitError('거주 지역을 선택해 주세요.');
      return;
    }
    // 자유 입력이라 오타가 그대로 넘어갈 수 있다. 서버는 이름으로 지역 테이블을 찾는데
    // 못 찾으면 오류 없이 빈 값으로 저장하므로("서울시" 같은 오타), 목록에 있는 값만 통과시킨다.
    if (!regionOptions.includes(region.trim())) {
      setSubmitError('거주 지역은 목록에서 선택해 주세요.');
      return;
    }
    // 시군구는 선택 입력이다(안 고르면 시도만 저장). 다만 뭔가 입력했다면
    // 시도와 마찬가지로 목록에 있는 값이어야 서버가 지역을 특정할 수 있다.
    if (sigungu.trim() && !sigunguOptions.includes(sigungu.trim())) {
      setSubmitError('시군구는 목록에서 선택해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await signup({
        // 서버가 소문자로 낮춰 저장하므로 중복확인 때와 같은 값으로 맞춰 보낸다.
        loginId: normalizeLoginId(loginId),
        email,
        password,
        name: name.trim(),
        phone: phone.trim(),
        gender: GENDER_TO_API[gender],
        agreements: terms.map((term) => ({
          type: AGREEMENT_TYPE_BY_ID[term.id],
          isAgreed: agreements[term.id],
        })),
        // 아래 3개는 화면에선 필수(*)라 위 검증을 통과하면 항상 값이 있다.
        // 다만 백엔드에선 선택 항목이라 타입상 optional이므로 빈 값 방어는 남겨둔다.
        birthDate,
        nationality: nationality ? NATIONALITY_TO_API[nationality] : undefined,
        // 서버는 region 을 문자열 하나로만 받는다(SignupRequest.region).
        // 시군구를 골랐으면 "서울 중구" 로 합쳐 보낸다 — RegionResolver 가
        // "시도 시군구" 조합을 가장 먼저 보므로 이 형태가 가장 정확하다.
        region:
          (sigungu.trim() ? `${region.trim()} ${sigungu.trim()}` : region.trim()) || undefined,
      });

      // 1. 토큰 저장 (이후 axios 요청 인터셉터가 자동으로 Bearer 첨부)
      tokenStorage.setTokens(data.accessToken, data.refreshToken, data.userId);
      // 2. 유저 전역 저장. 가입 응답엔 user 객체가 없어서 방금 입력한 이름을 쓰고,
      //    서버가 가입 시 온보딩 미완료(STEP_1)로 만들므로 onboardingCompleted는 false.
      setUser({ userId: data.userId, name: name.trim(), onboardingCompleted: false });
      // 3. 가입 직후엔 항상 온보딩부터
      navigate('/onboarding');
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, '회원가입 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-[1440px] min-h-screen font-['Pretendard'] mx-auto pb-[100px]">
      <header>
        <Header isSearchMode={false} logoOnly={true} onBack={() => {}} />
      </header>

      <main className="w-[1222px] mx-auto mt-[32px]">
        <div className="mb-[48px]">
          <h1 className="text-[32px] font-[700] text-[#10131A] mb-[12px]">회원가입</h1>
          <p className="text-[16px] font-[500] text-[#555964]">
            입력한 정보는 안전하게 보호되며, 장학금 추천 목적 외에는 사용되지 않아요.
          </p>
        </div>

        <div className="flex flex-col gap-[48px]">
          {/* 아이디: 로그인 식별자라 폼 맨 위에 둔다. 레이아웃은 이메일 행과 동일(입력 + 140px 버튼) */}
          <div className="flex flex-col gap-[12px]">
            <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
              아이디 <span className="text-[#FA5862] font-[500]">*</span>
            </div>
            <div className="flex gap-[16px]">
              <TextField1
                placeholder="아이디를 입력하세요"
                width="1070px"
                className="flex-1 h-[48px] [&_textarea]:h-[24px]"
                value={loginId}
                onChange={handleLoginIdChange}
                maxLength={20}
                /* 확인 뒤에도 잠그지 않는다. 다른 아이디를 넣어보려면 고칠 수 있어야 하고,
                                   고치는 순간 handleLoginIdChange가 확인 결과를 무효로 되돌린다. */
              />
              <Button
                variant={isLoginIdButtonDisabled ? 'disabled' : 'primary'}
                width="140px"
                paddingLeft="16px"
                paddingRight="16px"
                className="!text-[16px]"
                disabled={isLoginIdButtonDisabled}
                onClick={handleLoginIdCheck}
              >
                {/* 라벨은 항상 "중복 확인". 확인 여부는 아래 문구(✓ 사용할 수 있는 아이디예요)로 알린다.
                                    "확인 완료"로 바꾸면 다시 누를 수 있는 버튼인데도 끝난 것처럼 보인다. */}
                중복 확인
              </Button>
            </div>
            {/* 확인 결과가 없을 땐 규칙을 안내한다. 눌러보고 나서야 규칙을 아는 것보다 낫다. */}
            <StatusLine message={loginIdMessage} fallback={`※ ${LOGIN_ID_RULE_TEXT}`} />
          </div>

          <div className="flex flex-col gap-[12px]">
            <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
              이메일 주소 <span className="text-[#FA5862] font-[500]">*</span>
            </div>
            <div className="flex gap-[16px]">
              <TextField1
                placeholder="이메일 주소를 입력하세요"
                width="1070px"
                className="flex-1 h-[48px] [&_textarea]:h-[24px]"
                value={email}
                onChange={setEmail}
                disabled={verification.isVerified}
              />
              <Button
                variant={isEmailButtonDisabled ? 'disabled' : 'primary'}
                width="140px"
                paddingLeft="16px"
                paddingRight="16px"
                className="!text-[16px]"
                disabled={isEmailButtonDisabled}
                onClick={handleEmailButtonClick}
              >
                {emailButtonLabel}
              </Button>
            </div>
            {/* 단계별 안내: 중복 확인 결과 / 코드 발송 안내 / 실패 사유 */}
            <StatusLine
              message={verification.emailMessage}
              fallback="※ 이메일 중복을 확인해주세요."
            />
          </div>

          <div className="flex flex-col gap-[12px]">
            <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
              인증코드 <span className="text-[#FA5862] font-[500]">*</span>
            </div>
            <div className="flex gap-[16px] items-center relative">
              <TextField1
                placeholder="인증코드 6자리를 입력해주세요"
                width="1070px"
                className="flex-1 h-[48px] [&_textarea]:h-[24px]"
                value={code}
                onChange={setCode}
                maxLength={6}
                disabled={verification.step !== 'sent'}
              />
              {/* 코드 유효시간 카운트다운 (입력창 오른쪽 끝) */}
              {verification.step === 'sent' && verification.secondsLeft > 0 && (
                <span className="absolute right-[172px] text-[16px] font-[500] text-[#FF4D4F]">
                  {formatRemainingTime(verification.secondsLeft)}
                </span>
              )}
              <Button
                variant={
                  verification.step === 'sent' && !verification.isLoading ? 'primary' : 'disabled'
                }
                width="140px"
                paddingLeft="16px"
                paddingRight="16px"
                className="!text-[16px]"
                disabled={verification.step !== 'sent' || verification.isLoading}
                onClick={() => verification.verifyCode(code)}
              >
                인증하기
              </Button>
            </div>
            <StatusLine
              message={verification.codeMessage}
              fallback="※ 인증코드를 받지 못하셨다면 위의 재발송 버튼을 눌러주세요."
            />
          </div>

          <div className="grid grid-cols-2 gap-[24px]">
            <div className="relative flex flex-col gap-[12px]">
              <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                비밀번호 <span className="text-[#FA5862] font-[500]">*</span>
              </div>
              <div className="relative">
                {/* 공용 TextField1은 textarea 기반이라 가려쓰기(마스킹)가 안 돼서 실제 input을 쓴다.
                                    배경·모서리·글꼴은 TextField1과 같은 값으로 맞춤. */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                  className="w-[595px] h-[48px] bg-[#F9FAFC] rounded-lg pl-6 pr-[56px] py-3 font-['Pretendard'] font-medium text-[16px] leading-6 text-[#0A0C11] placeholder:text-[#9DA1AC] outline-none border-none caret-[#7962ED]"
                />
                <button
                  type="button"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                  className="absolute right-[24px] top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-[12px]">
              <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                비밀번호 확인 <span className="text-[#FA5862] font-[500]">*</span>
              </div>
              <div className="relative">
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  className="w-[595px] h-[48px] bg-[#F9FAFC] rounded-lg pl-6 pr-[56px] py-3 font-['Pretendard'] font-medium text-[16px] leading-6 text-[#0A0C11] placeholder:text-[#9DA1AC] outline-none border-none caret-[#7962ED]"
                />
                <button
                  type="button"
                  aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 표시'}
                  className="absolute right-[24px] top-1/2 -translate-y-1/2"
                  onClick={() => setShowPasswordConfirm((prev) => !prev)}
                >
                  <EyeIcon visible={showPasswordConfirm} />
                </button>
              </div>
              {/* 두 번 입력한 비밀번호가 다르면 바로 알려준다 */}
              {passwordConfirm && password !== passwordConfirm && (
                <span className="text-[14px] font-[500] text-[#FF4D4F]">
                  비밀번호가 서로 일치하지 않습니다.
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[24px]">
            <div className="flex flex-col gap-[12px]">
              <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                이름 <span className="text-[#FA5862] font-[500]">*</span>
              </div>
              <TextField1
                placeholder="이름을 입력해 주세요"
                width="595px"
                className={'h-[48px] [&_textarea]:h-[24px]'}
                value={name}
                onChange={setName}
              />
            </div>
            <div className="flex flex-col gap-[12px]">
              <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                생년월일 <span className="text-[#FA5862] font-[500]">*</span>
              </div>
              {/* 시안(1457:4958)은 한 칸짜리 드롭다운이지만 날짜를 한 목록에 다 넣을 수는 없어서
                                같은 595px 폭 안에서 연·월·일 셋으로 나눴다(193px×3 + 8px 간격×2 = 595px). */}
              <div className="flex gap-[8px]">
                <SelectDropdown
                  options={BIRTH_YEAR_OPTIONS}
                  value={birthYear}
                  onChange={setBirthYear}
                  placeholder="년"
                  width="193px"
                  className="h-[48px]"
                />
                <SelectDropdown
                  options={birthMonthOptions}
                  value={birthMonth}
                  onChange={setBirthMonth}
                  placeholder="월"
                  width="193px"
                  className="h-[48px]"
                />
                <SelectDropdown
                  options={birthDayOptions}
                  value={birthDay}
                  onChange={setBirthDay}
                  placeholder="일"
                  width="193px"
                  className="h-[48px]"
                />
              </div>
              <span className="text-[#747883] text-[14px] font-[500]">{BIRTH_DATE_RULE_TEXT}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[24px]">
            <div className="flex flex-col gap-[12px]">
              <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                연락처 <span className="text-[#FA5862] font-[500]">*</span>
              </div>
              {/* 숫자만 받고 하이픈은 자동으로 넣는다(010-1234-5678).
                                하이픈을 직접 치거나 통째로 붙여넣어도 같은 표기로 정리된다. */}
              <TextField1
                placeholder="연락처를 입력해 주세요"
                width="595px"
                className={'h-[48px] [&_textarea]:h-[24px]'}
                value={phone}
                onChange={(value) => setPhone(formatPhone(value))}
                inputMode="numeric"
                maxLength={13}
              />
            </div>
            <div className="flex flex-col gap-[12px]">
              <div className="text-[16px] font-[500] text-[#10131A] flex gap-[4px]">
                성별 <span className="text-[#FA5862] font-[500]">*</span>
              </div>
              <div className="flex gap-[8px]">
                <Select
                  label="여성"
                  status={gender === '여성' ? 'selected' : 'default'}
                  width="235.5px"
                  className="h-[48px] [&_span]:text-center"
                  onClick={() => setGender('여성')}
                />
                <Select
                  label="남성"
                  status={gender === '남성' ? 'selected' : 'default'}
                  width="235.5px"
                  className="h-[48px] [&_span]:text-center"
                  onClick={() => setGender('남성')}
                />
                <Select
                  label="선택 안함"
                  status={gender === '선택 안함' ? 'selected' : 'default'}
                  width="108px"
                  className="h-[48px] px-[16px] [&_span]:text-center"
                  onClick={() => setGender('선택 안함')}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[24px]">
            <div className="flex flex-col gap-[12px]">
              <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                국적 <span className="text-[#FA5862] font-[500]">*</span>
              </div>
              <div className="flex gap-[12px] h-[56px]">
                <Select
                  label="내국인"
                  status={nationality === '내국인' ? 'selected' : 'default'}
                  width="100%"
                  className="flex-1 h-[48px] [&_span]:text-center"
                  onClick={() => setNationality('내국인')}
                />
                <Select
                  label="외국인"
                  status={nationality === '외국인' ? 'selected' : 'default'}
                  width="100%"
                  className="flex-1 h-[48px] [&_span]:text-center"
                  onClick={() => setNationality('외국인')}
                />
              </div>
            </div>
            <div className="flex flex-col gap-[12px]">
              <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                거주 지역 <span className="text-[#FA5862] font-[500]">*</span>
              </div>
              {/* 전공명 검색과 같은 방식: 입력하면 서버에서 받은 지역 목록이 좁혀진다.
                                자유 입력이라 오타가 나면 저장이 안 되므로, 제출 때 목록에 있는 값인지 확인한다.

                                시도와 시군구는 좌우로 둔다. 원래 한 칸이 쓰던 595px 을 그대로 나눠 쓰므로
                                위아래 다른 입력칸과 오른쪽 끝이 맞는다. 각 칸은 flex-1 이고 TextField1 에는
                                width="100%" 를 줘서 부모가 정한 폭을 그대로 따르게 했다. */}
              <div className="flex w-[595px] gap-[12px]">
                <div className="relative flex-1" ref={regionBoxRef}>
                  <TextField1
                    placeholder="시도를 선택해 주세요"
                    width="100%"
                    className="h-[48px] [&_textarea]:h-[24px]"
                    value={region}
                    onChange={(value) => {
                      setRegion(value);
                      setShowRegionDropdown(true);
                    }}
                    onFocus={() => setShowRegionDropdown(true)}
                  />
                  {/* 목록 모양은 같은 화면의 출생년도(SelectDropdown)와 맞췄다.
                                        높이는 시도 17개가 최대라 400px(약 8개)까지 열어두고 나머지는 스크롤 — 240px면
                                        5개만 보여서 "지역이 몇 개 없나?"로 읽힌다. */}
                  {showRegionDropdown && filteredRegions.length > 0 && (
                    <ul className="absolute left-0 top-[calc(100%+4px)] z-20 max-h-[400px] w-full overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white py-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                      {filteredRegions.map((name) => (
                        <li key={name}>
                          <button
                            type="button"
                            className={`w-full px-6 py-3 text-left font-['Pretendard'] text-[16px] font-medium leading-6 hover:bg-[#F4F4FE] ${name === region.trim() ? 'bg-[#F4F4FE] text-[#7962ED]' : 'text-[#0A0C11]'}`}
                            onClick={() => {
                              // 시도가 바뀌면 이전 시군구는 무의미하므로 비운다.
                              setRegion(name);
                              setSigungu('');
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
                {/* 시군구(2단계). 선택 입력이라 안 골라도 가입은 된다.
                                    시도를 고르기 전에는 무엇을 부를지 모르므로 잠가 둔다. */}
                <div className="relative flex-1" ref={sigunguBoxRef}>
                  {/* TextField1 은 className 을 감싸는 div 에 붙인다. textarea 의
                                        disabled 만으로는 겉보기가 그대로라 흐리게 처리해 눈에 보이게 한다. */}
                  <TextField1
                    placeholder={
                      !region.trim()
                        ? '시도를 먼저 선택해 주세요'
                        : isLoadingSigungu
                          ? '불러오는 중…'
                          : sigunguOptions.length === 0
                            ? '선택할 수 있는 시군구가 없어요'
                            : '시군구를 선택해 주세요 (선택)'
                    }
                    width="100%"
                    className={`h-[48px] [&_textarea]:h-[24px] ${!region.trim() || isLoadingSigungu ? 'opacity-60' : ''}`}
                    value={sigungu}
                    disabled={!region.trim() || isLoadingSigungu}
                    onChange={(value) => {
                      setSigungu(value);
                      setShowSigunguDropdown(true);
                    }}
                    onFocus={() => setShowSigunguDropdown(true)}
                  />
                  {showSigunguDropdown && filteredSigungu.length > 0 && (
                    <ul className="absolute left-0 top-[calc(100%+4px)] z-20 max-h-[400px] w-full overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white py-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                      {filteredSigungu.map((name) => (
                        <li key={name}>
                          <button
                            type="button"
                            className={`w-full px-6 py-3 text-left font-['Pretendard'] text-[16px] font-medium leading-6 hover:bg-[#F4F4FE] ${name === sigungu.trim() ? 'bg-[#F4F4FE] text-[#7962ED]' : 'text-[#0A0C11]'}`}
                            onClick={() => {
                              setSigungu(name);
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
              {/* 시군구 조회 실패 사유. 시군구는 선택 입력이라 가입 자체를 막지는 않는다. */}
              {sigunguError && (
                <span className="text-[#FF4D4F] text-[14px] font-[500]">{sigunguError}</span>
              )}
              <span className="text-[#747883] text-[14px] font-[500]">
                ※ 장학금 추천 시 거주 지역 기준이 활용될 수 있어요.
              </span>
            </div>
          </div>
        </div>

        <div className="w-100% mt-[48px] bg-[#F9FAFC] border border-[#E5E7EB] rounded-[16px] px-[40px] py-[24px]">
          <div
            className="flex items-center gap-[12px] mb-[18px] cursor-pointer"
            onClick={handleAgreeAll}
          >
            <CheckboxIcon checked={isAllAgreed} />
            <span className="text-[15px] ont-[500] text-[#10131A]">전체 동의합니다.</span>
          </div>

          <div className="flex flex-col gap-[18px]">
            {terms.map((term) => (
              <div key={term.id} className="flex justify-between items-center">
                <div
                  className="flex items-center gap-[12px] cursor-pointer"
                  onClick={() => handleAgree(term.id)}
                >
                  <CheckboxIcon checked={agreements[term.id]} />
                  <span className="text-[14px] font-[500] text-[#555964]">
                    <span className="text-[#7962ED] font-[500]">
                      {term.text.split(']')[0] + ']'}
                    </span>
                    {term.text.split(']')[1]}
                  </span>
                </div>
                {term.id !== 4 && (
                  <button
                    type="button"
                    className="text-[14px] font-[500] text-[#555964] underline underline-offset-auto"
                    onClick={() => {
                      // TODO: 약관 본문 화면이 아직 없어서 비워둠. 화면 생기면 연결.
                    }}
                  >
                    자세히 보기
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 가입 실패 사유 (서버 message 우선) */}
        {submitError && (
          <p className="mt-[24px] text-right text-[16px] font-[500] text-[#FF4D4F]">
            {submitError}
          </p>
        )}

        <div className="mt-[48px] flex justify-end w-full gap-[16px]">
          <Button
            size="lg"
            weight="medium"
            width="157px"
            paddingLeft="16px"
            paddingRight="32px"
            className="text-[20px] bg-[#F3F4F6] !text-[#747883]"
            iconGap={16}
            leftIcon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.7104 8.1207L10.8304 12.0007L14.7104 15.8807C15.1004 16.2707 15.1004 16.9007 14.7104 17.2907C14.3204 17.6807 13.6904 17.6807 13.3004 17.2907L8.71043 12.7007C8.32043 12.3107 8.32043 11.6807 8.71043 11.2907L13.3004 6.7007C13.6904 6.3107 14.3204 6.3107 14.7104 6.7007C15.0904 7.0907 15.1004 7.7307 14.7104 8.1207Z"
                  fill="#747883"
                />
              </svg>
            }
            onClick={() => navigate('/login')}
          >
            돌아가기
          </Button>
          <Button
            size="lg"
            weight="bold"
            variant="gradient"
            width="133px"
            paddingLeft="32px"
            paddingRight="32px"
            className="text-[20px]"
            onClick={handleSubmit}
            disabled={!isAllRequiredAgreed || !verification.isVerified || isSubmitting}
          >
            {isSubmitting ? '가입 중...' : '회원가입'}
          </Button>
        </div>
      </main>
    </div>
  );
}
