import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPerson } from 'react-icons/md';
import Header from '../../components/common/Header/Header';
import AuthCard from '../../components/findAccount/AuthCard';
import AuthTextField from '../../components/findAccount/AuthTextField';
import CodeInput from '../../components/findAccount/CodeInput';
import StepNavButtons from '../../components/findAccount/StepNavButtons';
import Button from '../../components/Button/Button';
import {
  checkEmailAvailable,
  sendVerificationCode,
  verifyEmailCode,
} from '../../api/login/email';
import { findLoginId } from '../../api/login/findLoginId';
import { getApiErrorMessage } from '../../utils/apiError';

// 아이디 찾기: Figma 2462:4599(이메일) / 4696(이름) / 4748·4870(인증번호) / 4946(결과)
//
// 이력: 2026-08-16에 보안 문제로 로그인 화면에서 내렸다가 2026-08-17에 되살렸다.
//   - 내렸던 이유: 그때는 아이디가 곧 이메일이라("아이디 찾기 = 남의 이메일 알아내기"),
//     게다가 이름+전화번호로 찾는 방식이라 본인 확인 없이 계정 존재 여부가 새어나갔다.
//   - 되살린 근거: 백엔드에 users.login_id가 생겨 아이디와 이메일이 별개 값이 됐고(2026-08-17),
//     이 화면은 **이메일 인증코드 확인을 통과해야** 결과를 보여주므로 본인만 자기 아이디를 본다.
//
// ⚠️ 결과를 내려주는 서버 API(POST /auth/login-id/find)는 아직 없다. api/login/findLoginId.ts 참고.
//    붙기 전까지 마지막 단계에서 "아이디를 불러오지 못했어요"가 뜬다.

type Step = 'email' | 'name' | 'code' | 'done';

// 서버 application.yml의 cooldown-seconds와 동일. 이 시간 안에 재발송하면 429가 난다.
const RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FindIdPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loginId, setLoginId] = useState(''); // 서버에서 받아온 찾은 아이디

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // 재전송 쿨다운 카운트다운
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timerId = setInterval(() => setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timerId);
  }, [resendCooldown]);

  // 1단계: 이메일이 실제 가입된 계정인지 확인한다.
  // check API는 "가입 가능(available=true)"을 돌려주므로, 아이디 찾기에선 false여야 계정이 있는 것이다.
  const handleEmailNext = async () => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('이메일 형식을 확인해 주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const available = await checkEmailAvailable(email.trim());
      if (available) {
        setError('가입 이력이 없는 이메일이에요. 다시 확인해 주세요.');
        return;
      }
      setStep('name');
    } catch (err) {
      setError(getApiErrorMessage(err, '이메일 확인 중 문제가 발생했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  // 2단계: 이름을 받고 인증코드를 보낸다.
  // ⚠️ 이름을 서버와 대조하는 API가 없어 화면 단계로만 존재한다(입력 여부만 확인).
  const handleNameNext = async () => {
    if (!name.trim()) {
      setError('이름을 입력해 주세요.');
      return;
    }
    await sendCode();
  };

  const sendCode = async () => {
    setIsLoading(true);
    setError('');
    try {
      await sendVerificationCode(email.trim());
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setCode('');
      setStep('code');
    } catch (err) {
      // 429(쿨다운)면 서버 안내문구가 그대로 나온다.
      setError(getApiErrorMessage(err, '인증코드 발송에 실패했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  // 3단계: 인증코드 확인 → 통과하면 그 이메일로 가입된 아이디를 받아온다.
  // 검사·전송 모두 인자로 받은 값을 쓴다. CodeInput의 onComplete는 state 반영 전에 호출되므로
  // code state를 읽으면 6자리를 다 채워도 5자리가 잡혀 서버에도 잘린 코드가 나간다.
  const handleCodeNext = async (submittedCode: string) => {
    if (submittedCode.length < 6) {
      setError('인증번호 6자리를 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await verifyEmailCode(email.trim(), submittedCode);
    } catch (err) {
      setError(getApiErrorMessage(err, '인증코드 확인에 실패했습니다.'));
      setIsLoading(false);
      return;
    }

    // 코드 확인과 아이디 조회를 따로 잡는다. 한 덩어리로 묶으면 조회가 실패했는데도
    // "인증코드 확인 실패"로 안내돼 사용자가 코드를 다시 받으러 간다.
    try {
      // 아이디를 못 받아오면 결과 화면으로 넘기지 않는다. 빈 칸을 보여주느니 사유를 알리는 게 낫다.
      setLoginId(await findLoginId(email.trim()));
      setStep('done');
    } catch (err) {
      setError(getApiErrorMessage(err, '아이디를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-[1440px] bg-white">
      <Header logoOnly />

      <div className="pt-[184px]">
        {step === 'email' && (
          <AuthCard
            title="아이디 찾기"
            description="이메일을 입력해주세요."
            footer={<StepNavButtons onNext={handleEmailNext} disabled={isLoading} />}
          >
            <AuthTextField
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailNext()}
            />
            <ErrorText message={error} />
          </AuthCard>
        )}

        {step === 'name' && (
          <AuthCard
            title="아이디 찾기"
            description="이름을 입력해주세요."
            footer={
              <StepNavButtons
                onPrev={() => {
                  setError('');
                  setStep('email');
                }}
                onNext={handleNameNext}
                disabled={isLoading}
              />
            }
          >
            <div className="flex flex-col gap-[20px]">
              {/* 앞 단계에서 넣은 이메일은 확인용으로만 보여준다 */}
              <AuthTextField value={email} readOnlyLook />
              <AuthTextField
                placeholder="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameNext()}
              />
            </div>
            <ErrorText message={error} />
          </AuthCard>
        )}

        {step === 'code' && (
          <AuthCard
            topOffset={72}
            title={'이메일을 발송했어요\n인증번호를 입력해 주세요.'}
            footer={
              <StepNavButtons
                onPrev={() => {
                  setError('');
                  setStep('name');
                }}
                onNext={() => handleCodeNext(code)}
                disabled={isLoading}
              />
            }
          >
            <CodeInput value={code} onChange={setCode} onComplete={handleCodeNext} />

            <button
              type="button"
              disabled={resendCooldown > 0 || isLoading}
              onClick={sendCode}
              className="mt-[20px] text-[16px] font-bold leading-[24px] text-[#7962ED] underline disabled:text-[#9DA1AC]"
            >
              {resendCooldown > 0 ? `재전송 ${resendCooldown}초` : '재전송'}
            </button>

            <ErrorText message={error} />
          </AuthCard>
        )}

        {step === 'done' && (
          <AuthCard
            topOffset={72}
            title="아이디를 찾았어요."
            description={"비밀번호를 잊으셨다면\n'비밀번호 찾기'를 눌러 주세요."}
            footerClassName="absolute bottom-[56px] left-[89px] w-[596px]"
            footer={
              <div className="flex gap-[24px]">
                <Button
                  size="lg"
                  variant="outline"
                  weight="bold"
                  width="286px"
                  onClick={() => navigate('/find-password')}
                  className="!h-[64px] !border-[#E6E7EB] !bg-[#F9FAFC] !text-[#555964]"
                >
                  비밀번호 찾기
                </Button>
                <Button
                  size="lg"
                  variant="primary"
                  weight="bold"
                  width="286px"
                  onClick={() => navigate('/login')}
                  className="!h-[64px]"
                >
                  로그인하러 가기
                </Button>
              </div>
            }
          >
            {/* 찾은 아이디 표시. 이메일과 별개인 로그인 아이디(users.login_id) */}
            <div className="relative flex h-[64px] w-[596px] items-center rounded-[8px] border border-[#D2D4DA] bg-white">
              <div className="ml-[24px] flex size-[40px] shrink-0 items-center justify-center rounded-full bg-[#F4F4FE]">
                <MdPerson size={20} className="text-[#7962ED]" />
              </div>
              <span className="ml-[12px] truncate text-[20px] font-medium leading-[28px] tracking-[-0.005em] text-[#555964]">
                {loginId}
              </span>
            </div>
          </AuthCard>
        )}
      </div>
    </div>
  );
}

// 입력 아래 공통 에러 문구. 자리를 항상 차지하면 카드 높이가 고정이라 레이아웃이 안 흔들린다.
function ErrorText({ message }: { message: string }) {
  if (!message) return null;
  return <p className="mt-[12px] text-[14px] font-medium leading-[20px] text-[#FF4D4F]">{message}</p>;
}
