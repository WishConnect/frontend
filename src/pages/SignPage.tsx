import { useState } from 'react';
import Header from "../components/common/Header/Header";
import TextField1 from "../components/TextField1";
import DropDown from "../components/DropDown";
import Button from "../components/Button/Button";
import Select from "../components/Select";

type Gender = '여성' | '남성' | '선택 안함';
type Nationality = '내국인' | '외국인';

export default function SignPage() {
    const [email, setEmail] = useState('');
    // const [isEmailVerified, setIsEmailVerified] = useState(false);
    // const [code, setCode] = useState('');
    // const [isCodeSent, setIsCodeSent] = useState(false); 
    // const [isCodeVerified, setIsCodeVerified] = useState(false);
    // const [remainingSeconds, setRemainingSeconds] = useState(180);

    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    // 머지 후 추가
    // const [showPassword, setShowPassword] = useState(false);
    // const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    // 드롭박스 정보 주석처리
    const [name, setName] = useState('');
    // const [birthYear, setBirthYear] = useState<string | null>(null);
    const [contact, setContact] = useState('');
    const [gender, setGender] = useState<Gender | null>(null);
    const [nationality, setNationality] = useState<Nationality | null>(null);
    // const [residence, setResidence] = useState<string | null>(null);

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

    const CheckboxIcon = ({ checked }: { checked: boolean }) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 cursor-pointer">
            <rect x="2" y="2" width="20" height="20" rx="6" fill={checked ? "#7962ED" : "#FFFFFF"} stroke={checked ? "#7962ED" : "#D2D4DA"} strokeWidth="1.5" />
            {checked && <path d="M7.5 12L10.5 15L16.5 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
    );

    // 머지 후 추가
    // const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
    //     <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    //         <path d="M10.5938 13.2812C9.5625 13.2812 8.58594 13.1562 7.66406 12.9062C6.74219 12.6562 5.88802 12.3255 5.10156 11.9141C4.3151 11.5026 3.60677 11.0495 2.97656 10.5547C2.35156 10.0547 1.8151 9.55729 1.36719 9.0625C0.924479 8.5625 0.585938 8.09896 0.351562 7.67188C0.117188 7.24479 0 6.90104 0 6.64062C0 6.375 0.117188 6.03125 0.351562 5.60938C0.585938 5.18229 0.924479 4.71875 1.36719 4.21875C1.8151 3.71875 2.35156 3.22135 2.97656 2.72656C3.60677 2.23177 4.3151 1.77865 5.10156 1.36719C5.88802 0.955729 6.74219 0.625 7.66406 0.375C8.58594 0.125 9.5625 0 10.5938 0C11.6354 0 12.6172 0.125 13.5391 0.375C14.4661 0.625 15.3229 0.955729 16.1094 1.36719C16.8958 1.77865 17.6016 2.23177 18.2266 2.72656C18.8516 3.22135 19.3828 3.71875 19.8203 4.21875C20.263 4.71875 20.599 5.18229 20.8281 5.60938C21.0625 6.03125 21.1797 6.375 21.1797 6.64062C21.1797 6.90104 21.0625 7.24479 20.8281 7.67188C20.599 8.09896 20.263 8.5625 19.8203 9.0625C19.3828 9.55729 18.8516 10.0547 18.2266 10.5547C17.6068 11.0495 16.9036 11.5026 16.1172 11.9141C15.3307 12.3255 14.474 12.6562 13.5469 12.9062C12.6198 13.1562 11.6354 13.2812 10.5938 13.2812ZM10.5938 11.0078C11.1927 11.0078 11.7552 10.8958 12.2812 10.6719C12.8125 10.4427 13.2786 10.1276 13.6797 9.72656C14.0807 9.32552 14.3932 8.86198 14.6172 8.33594C14.8464 7.8099 14.9609 7.24479 14.9609 6.64062C14.9609 6.03646 14.8464 5.47135 14.6172 4.94531C14.3932 4.41927 14.0807 3.95573 13.6797 3.55469C13.2786 3.15365 12.8125 2.84115 12.2812 2.61719C11.7552 2.38802 11.1927 2.27344 10.5938 2.27344C9.98958 2.27344 9.42448 2.38802 8.89844 2.61719C8.3724 2.84115 7.90885 3.15365 7.50781 3.55469C7.10677 3.95573 6.79167 4.41927 6.5625 4.94531C6.33854 5.47135 6.22656 6.03646 6.22656 6.64062C6.22656 7.24479 6.33854 7.8099 6.5625 8.33594C6.79167 8.86198 7.10677 9.32552 7.50781 9.72656C7.90885 10.1276 8.3724 10.4427 8.89844 10.6719C9.42448 10.8958 9.98958 11.0078 10.5938 11.0078ZM10.5938 8.23438C10.151 8.23438 9.77344 8.08073 9.46094 7.77344C9.15365 7.46094 9 7.08333 9 6.64062C9 6.19792 9.15365 5.82292 9.46094 5.51562C9.77344 5.20312 10.151 5.04688 10.5938 5.04688C11.0312 5.04688 11.4062 5.20312 11.7188 5.51562C12.0312 5.82292 12.1875 6.19792 12.1875 6.64062C12.1875 7.08333 12.0312 7.46094 11.7188 7.77344C11.4062 8.08073 11.0312 8.23438 10.5938 8.23438Z" fill="#9DA1AC"/>
    //     </svg>
    // );

    const isSubmitDisabled =
        !password ||
        password !== passwordConfirm ||
        !name ||
        !contact ||
        !gender ||
        !nationality;

    return (
        <div className="w-[1440px] min-h-screen font-['Pretendard'] mx-auto pb-[100px]">
            <header>
                <Header isSearchMode={false} logoOnly={true} onBack={() => {}} />
            </header>

            <main className="w-[1188px] mx-auto mt-[32px]">

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
                                placeholder="이메일 주소를 입력해주세요"
                                width="100%"
                                value={email}
                                onChange={setEmail}
                                className='flex-1 !h-[56px] !rounded-[8px] !px-[20px] [&_textarea]:!h-[24px] [&_textarea]:!leading-[24px] [&_textarea]:!resize-none'
                            />
                            <Button width="160px" className="shrink-0 !h-[56px]">
                                중복 확인
                            </Button>
                        </div>
                        <div className="h-[20px]">
                            {/* {isEmailVerified ? (
                                <span className="text-[#7962ED] text-[14px] font-[500] flex items-center gap-[4px]">
                                    사용할 수 있는 이메일이에요.
                                </span>
                            ) : (
                                <span className="text-[#9DA1AC] text-[14px] font-[500]">※ 이메일 중복을 확인해주세요.</span>
                            )} */}
                        </div>
                    </div>

                    <div className="flex flex-col gap-[12px]">
                        <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                            인증코드 <span className="text-[#FA5862] font-[500]">*</span>
                        </div>
                        <div className="flex gap-[16px] items-center relative">
                            <TextField1
                                placeholder="인증코드 6자리를 입력해주세요"
                                width="100%"
                                className='flex-1 !h-[56px] !rounded-[8px] !px-[20px] [&_textarea]:!h-[24px] [&_textarea]:!leading-[24px]'
                            />
                            <Button width="160px" className="shrink-0 !h-[56px]">
                                인증하기
                            </Button>
                        </div>
                        <div className="h-[20px]">
                            {/* {isCodeVerified ? (
                                <span className="text-[#7962ED] text-[14px] font-[500] flex items-center gap-[4px]">
                                    인증코드가 확인됐어요.
                                </span>
                            ) : (
                                <span className="text-[#9DA1AC] text-[14px] font-[500]">※ 인증코드를 받지 못하셨나요?</span>
                            )} */}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-[24px]">
                        <div className="flex flex-col gap-[12px]">
                            <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                                비밀번호 <span className="text-[#FA5862] font-[500]">*</span>
                            </div>
                            <TextField1
                                placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                                width="100%"
                                value={password}
                                onChange={setPassword}
                                className={`!h-[56px] !rounded-[8px] !pl-[20px] !pr-[50px] [&_textarea]:!h-[24px] [&_textarea]:!leading-[24px] ${
                                        !password ? '[&_textarea]:[-webkit-text-security:disc]' : ''
                                    }`}
                            />
                        </div>
                        <div className="flex flex-col gap-[12px]">
                            <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                                비밀번호 확인 <span className="text-[#FA5862] font-[500]">*</span>
                            </div>
                            <TextField1
                                placeholder="비밀번호를 다시 입력해주세요"
                                width="100%"
                                value={passwordConfirm}
                                onChange={setPasswordConfirm}
                                className={`!h-[56px] !rounded-[8px] !pl-[20px] !pr-[50px] [&_textarea]:!h-[24px] [&_textarea]:!leading-[24px] ${
                                        !password ? '[&_textarea]:[-webkit-text-security:disc]' : ''
                                    }`}                         
                                />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-[24px]">
                        <div className="flex flex-col gap-[12px]">
                            <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                                이름 <span className="text-[#FA5862] font-[500]">*</span>
                            </div>
                            <TextField1
                                placeholder="이름을 입력해 주세요"
                                width="100%"
                                value={name}
                                onChange={setName}
                                className='!h-[56px] !rounded-[8px] !px-[20px] [&_textarea]:!h-[24px] [&_textarea]:!leading-[24px]'
                            />
                        </div>
                        <div className="flex flex-col gap-[12px]">
                            <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                                출생년도 <span className="text-[#FA5862] font-[500]">*</span>
                            </div>
                            <DropDown
                                label={"선택해 주세요"}
                                width="100%"
                                className="!h-[56px] !rounded-[8px] [&_span]:!flex-1 [&_span]:!w-auto"                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-[24px]">
                        <div className="flex flex-col gap-[12px]">
                            <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                                연락처 <span className="text-[#FA5862] font-[500]">*</span>
                            </div>
                            <TextField1
                                placeholder="연락처를 입력해 주세요"
                                width="100%"
                                value={contact}
                                onChange={setContact}
                                className='!h-[56px] !rounded-[8px] !px-[20px] [&_textarea]:!h-[24px] [&_textarea]:!leading-[24px]'
                            />
                        </div>
                        <div className="flex flex-col gap-[12px]">
                            <div className="text-[16px] font-[500] text-[#10131A] flex gap-[4px]">
                                성별 <span className="text-[#FA5862] font-[500]">*</span>
                            </div>
                            <div className="flex gap-[8px] h-[56px]">
                                <Select
                                    label="여성"
                                    status={gender === '여성' ? 'selected' : 'default'}
                                    width="235.5px"
                                    className="!h-[56px] [&_span]:!text-center"
                                    onClick={() => setGender('여성')}
                                />
                                <Select
                                    label="남성"
                                    status={gender === '남성' ? 'selected' : 'default'}
                                    width="235.5px"
                                    className="!h-[56px] [&_span]:!text-center"
                                    onClick={() => setGender('남성')}
                                />
                                <Select
                                    label="선택 안함"
                                    status={gender === '선택 안함' ? 'selected' : 'default'}
                                    width="108px"
                                    className={`!h-[56px] !px-0 [&_span]:!text-center shrink-0 ${
                                        gender !== '선택 안함' ? '[&_span]:!text-[#9DA1AC]' : ''
                                    }`}
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
                                    className="flex-1 !h-[56px] [&_span]:!text-center"
                                    onClick={() => setNationality('내국인')}
                                />
                                <Select
                                    label="외국인"
                                    status={nationality === '외국인' ? 'selected' : 'default'}
                                    width="100%"
                                    className="flex-1 !h-[56px] [&_span]:!text-center"
                                    onClick={() => setNationality('외국인')}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-[12px]">
                            <div className="text-[15px] font-[600] text-[#10131A] flex gap-[4px]">
                                거주 지역 <span className="text-[#FA5862] font-[500]">*</span>
                            </div>
                            <DropDown
                                label={"선택해 주세요"}
                                width="100%"
                                className="!h-[56px] !rounded-[8px] [&_span]:!flex-1 [&_span]:!w-auto"
                                />
                            <span className="text-[#9DA1AC] text-[13px] font-[500]">※ 장학금 추천 시 거주 지역 기준이 활용될 수 있어요.</span>
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
                                    <button className="text-[14px] font-[500] text-[#555964] underline underline-offset-auto">
                                        자세히 보기
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-[48px] flex justify-end w-full gap-[16px]">
                    <Button width="160px" variant="disabled" className="!h-[56px]" leftIcon>
                        돌아가기
                    </Button>
                    <Button width="160px" disabled={isSubmitDisabled} className="!h-[56px]">
                        회원가입
                    </Button>
                </div>

            </main>
        </div>
    );
}