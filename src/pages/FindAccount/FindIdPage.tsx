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
import { getApiErrorMessage } from '../../utils/apiError';

// 아이디 찾기: Figma 2462:4599(이메일) / 4696(이름) / 4748·4870(인증번호) / 4946(결과)
//
// ⚠️ 백엔드에 "아이디 찾기" 전용 엔드포인트가 없다(auth 전체가 password 2종 + email 3종 + signup/login/social뿐).
//    그리고 User 엔티티에 아이디 필드 자체가 없어서 로그인 식별자는 email 하나다.
//    그래서 "아이디 = 이메일"로 보고, 이메일 소유를 인증코드로 확인한 뒤 그 이메일을 아이디로 보여준다.
//    (디자인 시안의 'wishconnect' 같은 별도 아이디 개념은 서버에 존재하지 않음)

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

  // 3단계: 인증코드 확인. 통과하면 이메일 소유가 증명된 것으로 본다.
  const handleCodeNext = async () => {
    if (code.length < 6) {
      setError('인증번호 6자리를 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await verifyEmailCode(email.trim(), code);
      setStep('done');
    } catch (err) {
      setError(getApiErrorMessage(err, '인증코드 확인에 실패했습니다.'));
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
                onNext={handleCodeNext}
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
            {/* 찾은 아이디 표시. 아이디 = 로그인에 쓰는 이메일 */}
            <div className="relative flex h-[64px] w-[596px] items-center rounded-[8px] border border-[#D2D4DA] bg-white">
              <div className="ml-[24px] flex size-[40px] shrink-0 items-center justify-center rounded-full bg-[#F4F4FE]">
                <MdPerson size={20} className="text-[#7962ED]" />
              </div>
              <span className="ml-[12px] truncate text-[20px] font-medium leading-[28px] tracking-[-0.005em] text-[#555964]">
                {email}
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
