import { useEffect, useState } from 'react';
import Header from "../components/common/Header/Header";
import TextField1 from "../components/TextField1";
import Button from "../components/Button/Button";
import Select from "../components/Select";
import SelectDropdown from "../components/common/SelectDropdown";
import { useNavigate } from 'react-router-dom';
import { signup } from '../api/login/signup';
import { formatRemainingTime, useEmailVerification, type StatusMessage } from '../hooks/useEmailVerification';
import { getApiErrorMessage } from '../utils/apiError';
import { getPasswordError } from '../utils/password';
import { tokenStorage } from '../utils/token';
import { useUserStore } from '../store/user/user';
import { getRegions } from '../api/region';
import type {
    AgreementType,
    Gender as ApiGender,
    Nationality as ApiNationality,
} from '../types/login/auth';

type Gender = '여성' | '남성' | '선택 안함';
type Nationality = '내국인' | '외국인';

// 화면에 보이는 한글 선택지를 백엔드 enum 값으로 바꾸는 표.
const GENDER_TO_API: Record<Gender, ApiGender> = {
    '여성': 'FEMALE',
    '남성': 'MALE',
    '선택 안함': 'NONE',
};
const NATIONALITY_TO_API: Record<Nationality, ApiNationality> = {
    '내국인': 'DOMESTIC',
    '외국인': 'FOREIGN',
};
// 약관 체크박스 id(1~4) → 백엔드 AgreementType
const AGREEMENT_TYPE_BY_ID: Record<number, AgreementType> = {
    1: 'TERMS',
    2: 'PRIVACY',
    3: 'THIRD_PARTY',
    4: 'AGE_14',
};

// 출생년도 선택지: 만 14세 이상만 가입 가능(약관)이므로 올해-14년부터 1950년까지.
const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEAR_OPTIONS = Array.from(
    { length: CURRENT_YEAR - 14 - 1950 + 1 },
    (_, index) => `${CURRENT_YEAR - 14 - index}년`,
);

// 안내문구 색상: 일반 안내(회색) / 성공(초록) / 실패(빨강)
const MESSAGE_TONE_CLASS: Record<StatusMessage['tone'], string> = {
    info: 'text-[#747883]',
    success: 'text-[#00BF8A]',
    error: 'text-[#FF4D4F]',
};

// 약관 동의 체크박스 아이콘.
// 원래 SignPage 안(렌더 함수 내부)에 선언돼 있었는데, 그러면 렌더할 때마다 새 컴포넌트로 취급돼
// 리렌더 비용이 커지고 lint(react-hooks)도 막아서 바깥으로 뺐다. 모양은 그대로.
function CheckboxIcon({ checked }: { checked: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 cursor-pointer">
            <rect x="2" y="2" width="20" height="20" rx="6" fill={checked ? "#7962ED" : "#FFFFFF"} stroke={checked ? "#7962ED" : "#D2D4DA"} strokeWidth="1.5" />
            {checked && <path d="M7.5 12L10.5 15L16.5 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
    );
}

// 비밀번호 표시/숨김 토글에 쓰는 눈 아이콘. 숨김 상태일 땐 사선을 덧그린다.
function EyeIcon({ visible }: { visible: boolean }) {
    return (
        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5938 13.2812C9.5625 13.2812 8.58594 13.1562 7.66406 12.9062C6.74219 12.6562 5.88802 12.3255 5.10156 11.9141C4.3151 11.5026 3.60677 11.0495 2.97656 10.5547C2.35156 10.0547 1.8151 9.55729 1.36719 9.0625C0.924479 8.5625 0.585938 8.09896 0.351562 7.67188C0.117188 7.24479 0 6.90104 0 6.64062C0 6.375 0.117188 6.03125 0.351562 5.60938C0.585938 5.18229 0.924479 4.71875 1.36719 4.21875C1.8151 3.71875 2.35156 3.22135 2.97656 2.72656C3.60677 2.23177 4.3151 1.77865 5.10156 1.36719C5.88802 0.955729 6.74219 0.625 7.66406 0.375C8.58594 0.125 9.5625 0 10.5938 0C11.6354 0 12.6172 0.125 13.5391 0.375C14.4661 0.625 15.3229 0.955729 16.1094 1.36719C16.8958 1.77865 17.6016 2.23177 18.2266 2.72656C18.8516 3.22135 19.3828 3.71875 19.8203 4.21875C20.263 4.71875 20.599 5.18229 20.8281 5.60938C21.0625 6.03125 21.1797 6.375 21.1797 6.64062C21.1797 6.90104 21.0625 7.24479 20.8281 7.67188C20.599 8.09896 20.263 8.5625 19.8203 9.0625C19.3828 9.55729 18.8516 10.0547 18.2266 10.5547C17.6068 11.0495 16.9036 11.5026 16.1172 11.9141C15.3307 12.3255 14.474 12.6562 13.5469 12.9062C12.6198 13.1562 11.6354 13.2812 10.5938 13.2812ZM10.5938 11.0078C11.1927 11.0078 11.7552 10.8958 12.2812 10.6719C12.8125 10.4427 13.2786 10.1276 13.6797 9.72656C14.0807 9.32552 14.3932 8.86198 14.6172 8.33594C14.8464 7.8099 14.9609 7.24479 14.9609 6.64062C14.9609 6.03646 14.8464 5.47135 14.6172 4.94531C14.3932 4.41927 14.0807 3.95573 13.6797 3.55469C13.2786 3.15365 12.8125 2.84115 12.2812 2.61719C11.7552 2.38802 11.1927 2.27344 10.5938 2.27344C9.98958 2.27344 9.42448 2.38802 8.89844 2.61719C8.3724 2.84115 7.90885 3.15365 7.50781 3.55469C7.10677 3.95573 6.79167 4.41927 6.5625 4.94531C6.33854 5.47135 6.22656 6.03646 6.22656 6.64062C6.22656 7.24479 6.33854 7.8099 6.5625 8.33594C6.79167 8.86198 7.10677 9.32552 7.50781 9.72656C7.90885 10.1276 8.3724 10.4427 8.89844 10.6719C9.42448 10.8958 9.98958 11.0078 10.5938 11.0078ZM10.5938 8.23438C10.151 8.23438 9.77344 8.08073 9.46094 7.77344C9.15365 7.46094 9 7.08333 9 6.64062C9 6.19792 9.15365 5.82292 9.46094 5.51562C9.77344 5.20312 10.151 5.04688 10.5938 5.04688C11.0312 5.04688 11.4062 5.20312 11.7188 5.51562C12.0312 5.82292 12.1875 6.19792 12.1875 6.64062C12.1875 7.08333 12.0312 7.46094 11.7188 7.77344C11.4062 8.08073 11.0312 8.23438 10.5938 8.23438Z" fill="#9DA1AC"/>
            {!visible && (
                <path d="M1 1L21 13" stroke="#9DA1AC" strokeWidth="2" strokeLinecap="round" />
            )}
        </svg>
    );
}

export default function SignPage() {
    const navigate = useNavigate();
    const setUser = useUserStore((state) => state.setUser);

    // 입력값
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [region, setRegion] = useState('');
    const [regionOptions, setRegionOptions] = useState<string[]>([]);
    const [isLoadingRegions, setIsLoadingRegions] = useState(true);
    const [gender, setGender] = useState<Gender | null>(null);
    const [nationality, setNationality] = useState<Nationality | null>(null);

    // 비밀번호 표시 여부
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    // 제출 상태
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 이메일 인증(중복확인 → 코드발송 → 코드확인) 상태와 동작
    const verification = useEmailVerification(email);

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const response = await getRegions();
                setRegionOptions(response.data.data.map(({ name }) => name));
            } catch (error) {
                console.error('거주 지역 목록 조회 실패:', error);
                setSubmitError('거주 지역 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
            } finally {
                setIsLoadingRegions(false);
            }
        };

        fetchRegions();
    }, []);

    const terms = [
        { id: 1, text: "[필수] 이용약관 동의" },
        { id: 2, text: "[필수] 개인 정보 수집 및 이용 동의" },
        { id: 3, text: "[필수] 개인 정보 제3자 제공 동의" },
        { id: 4, text: "[필수] 만 14세 이상입니다." },
    ];
    const [agreements, setAgreements] = useState<Record<number, boolean>>({
        1: false, 2: false, 3: false, 4: false,
    });

    const isAllAgreed = terms.every((term) => agreements[term.id]);

    const handleAgreeAll = () => {
        const newValue = !isAllAgreed;
        setAgreements({ 1: newValue, 2: newValue, 3: newValue, 4: newValue });
    };

    const handleAgree = (id: number) => {
        setAgreements((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const isAllRequiredAgreed = terms.filter((term) => term.text.includes('[필수]')).every((term) => agreements[term.id]);

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
        if (!birthYear) {
            setSubmitError('출생년도를 선택해 주세요.');
            return;
        }
        if (!phone.trim()) {
            setSubmitError('연락처를 입력해 주세요.');
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
        try {
            const data = await signup({
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
                birthYear: birthYear ? Number.parseInt(birthYear, 10) : undefined,
                nationality: nationality ? NATIONALITY_TO_API[nationality] : undefined,
                region: region || undefined,
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
                    <div className="flex flex-col gap-[12px]">
                        <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                            이메일 주소 <span className="text-[#FA5862] font-[500]">*</span>
                        </div>
                        <div className="flex gap-[16px]">
                            <TextField1
                                placeholder="이메일 주소를 입력하세요"
                                width="1070px"
                                className='flex-1 h-[48px] [&_textarea]:h-[24px]'
                                value={email}
                                onChange={setEmail}
                                disabled={verification.isVerified}
                            />
                            <Button
                                variant={isEmailButtonDisabled ? 'disabled' : 'primary'}
                                width='140px'
                                paddingLeft='16px'
                                paddingRight='16px'
                                className='!text-[16px]'
                                disabled={isEmailButtonDisabled}
                                onClick={handleEmailButtonClick}
                            >
                                {emailButtonLabel}
                            </Button>
                        </div>
                        {/* 단계별 안내: 중복 확인 결과 / 코드 발송 안내 / 실패 사유 */}
                        <div className={`text-[14px] font-[500] ${verification.emailMessage ? MESSAGE_TONE_CLASS[verification.emailMessage.tone] : 'text-[#747883]'}`}>
                            {verification.emailMessage?.text ?? '※ 이메일 중복을 확인해주세요.'}
                        </div>
                    </div>

                    <div className="flex flex-col gap-[12px]">
                        <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                            인증코드 <span className="text-[#FA5862] font-[500]">*</span>
                        </div>
                        <div className="flex gap-[16px] items-center relative">
                            <TextField1
                                placeholder="인증코드 6자리를 입력해주세요"
                                width="1070px"
                                className='flex-1 h-[48px] [&_textarea]:h-[24px]'
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
                                variant={verification.step === 'sent' && !verification.isLoading ? 'primary' : 'disabled'}
                                width='140px'
                                paddingLeft='16px'
                                paddingRight='16px'
                                className='!text-[16px]'
                                disabled={verification.step !== 'sent' || verification.isLoading}
                                onClick={() => verification.verifyCode(code)}
                            >
                                인증하기
                            </Button>
                        </div>
                        <div className={`text-[14px] font-[500] ${verification.codeMessage ? MESSAGE_TONE_CLASS[verification.codeMessage.tone] : 'text-[#747883]'}`}>
                            {verification.codeMessage?.text ?? '※ 인증코드를 받지 못하셨다면 위의 재발송 버튼을 눌러주세요.'}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-[24px]">
                        <div className="relative flex flex-col gap-[12px]">
                            <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                                비밀번호 <span className="text-[#FA5862] font-[500]">*</span>
                            </div>
                            <div className='relative'>
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
                                    className='absolute right-[24px] top-1/2 -translate-y-1/2'
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
                            <div className='relative'>
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
                                    className='absolute right-[24px] top-1/2 -translate-y-1/2'
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
                                출생년도 <span className="text-[#FA5862] font-[500]">*</span>
                            </div>
                            <SelectDropdown
                                options={BIRTH_YEAR_OPTIONS}
                                value={birthYear}
                                onChange={setBirthYear}
                                placeholder="선택해 주세요"
                                width="595px"
                                className="h-[48px]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-[24px]">
                        <div className="flex flex-col gap-[12px]">
                            <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                                연락처 <span className="text-[#FA5862] font-[500]">*</span>
                            </div>
                            <TextField1
                                placeholder="연락처를 입력해 주세요"
                                width="595px"
                                className={'h-[48px] [&_textarea]:h-[24px]'}
                                value={phone}
                                onChange={setPhone}
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
                                    className='h-[48px] px-[16px] [&_span]:text-center'
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
                            <SelectDropdown
                                options={regionOptions}
                                value={region}
                                onChange={setRegion}
                                placeholder={isLoadingRegions ? "거주 지역을 불러오는 중..." : "선택해 주세요"}
                                width="595px"
                                className="h-[48px]"
                            />
                            <span className="text-[#747883] text-[14px] font-[500]">※ 장학금 추천 시 거주 지역 기준이 활용될 수 있어요.</span>
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
                                {term.id !==4 && (
                                    <button
                                        type="button"
                                        className="text-[14px] font-[500] text-[#555964] underline underline-offset-auto"
                                        onClick={()=> {
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
                    <p className="mt-[24px] text-right text-[16px] font-[500] text-[#FF4D4F]">{submitError}</p>
                )}

                <div className="mt-[48px] flex justify-end w-full gap-[16px]">
                    <Button
                        size='lg'
                        weight='medium'
                        width='157px'
                        paddingLeft='16px'
                        paddingRight='32px'
                        className='text-[20px] bg-[#F3F4F6] !text-[#747883]'
                        iconGap={16}
                        leftIcon={
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.7104 8.1207L10.8304 12.0007L14.7104 15.8807C15.1004 16.2707 15.1004 16.9007 14.7104 17.2907C14.3204 17.6807 13.6904 17.6807 13.3004 17.2907L8.71043 12.7007C8.32043 12.3107 8.32043 11.6807 8.71043 11.2907L13.3004 6.7007C13.6904 6.3107 14.3204 6.3107 14.7104 6.7007C15.0904 7.0907 15.1004 7.7307 14.7104 8.1207Z" fill="#747883"/>
                            </svg>
                        }
                        onClick={() => navigate('/login')}
                    >
                        돌아가기
                    </Button>
                    <Button
                        size='lg'
                        weight='bold'
                        variant='gradient'
                        width='133px'
                        paddingLeft='32px'
                        paddingRight='32px'
                        className='text-[20px]'
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
