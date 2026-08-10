import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import AuthCard from '../../components/findAccount/AuthCard';
import AuthTextField from '../../components/findAccount/AuthTextField';
import CodeInput from '../../components/findAccount/CodeInput';
import StepNavButtons from '../../components/findAccount/StepNavButtons';
import { checkEmailAvailable } from '../../api/login/email';
import { requestPasswordReset, resetPassword } from '../../api/login/password';
import { getApiErrorMessage } from '../../utils/apiError';
import { getPasswordError } from '../../utils/password';

// 비밀번호 찾기: Figma 2462:5177(이메일) / 5216(이름) / 5259·5302(인증번호) / 5359(새 비밀번호)
//
// 이 시스템은 아이디 = 이메일이다(User 엔티티에 아이디 필드가 없고 로그인도 이메일로 한다).
// 그래서 화면에서 "아이디"라는 말을 쓰지 않고 이메일 하나로만 받는다(2026-08-09 팀 결정).
// 시안(2462:5148)엔 아이디 입력이 1단계로 따로 있었지만, 그건 결국 같은 이메일을 두 번 받는
// 꼴이라 단계를 합쳤다. → 시안보다 한 단계 적다.
//
// ⚠️ 이름은 서버에 대조 API가 없어 입력 여부만 본다.
//
// ⚠️ 비밀번호 재설정에는 코드만 따로 검증하는 API가 없다.
//    (/auth/password/reset 이 email+code+newPassword를 한 번에 받는다)
//    그래서 인증번호는 3단계에서 받아두고 실제 검증은 4단계 "확인"에서 일어난다.

type Step = 'email' | 'name' | 'code' | 'password';

const RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FindPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timerId = setInterval(() => setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timerId);
  }, [resendCooldown]);

  // 1단계: 이메일이 실제로 가입된 계정인지 확인.
  // available=true면 그 이메일로 가입한 LOCAL 계정이 없다는 뜻이다.
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

  // 2단계: 이름 입력 후 재설정 코드 발송.
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
      await requestPasswordReset(email.trim());
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setCode('');
      setStep('code');
    } catch (err) {
      setError(getApiErrorMessage(err, '인증코드 발송에 실패했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  // 3단계: 코드는 여기서 검증할 방법이 없어 형식만 보고 넘어간다(실제 검증은 4단계).
  const handleCodeNext = () => {
    if (code.length < 6) {
      setError('인증번호 6자리를 모두 입력해 주세요.');
      return;
    }
    setError('');
    setStep('password');
  };

  // 4단계: 코드 + 새 비밀번호를 함께 보내 실제 재설정.
  const handleSubmit = async () => {
    // 서버까지 갔다가 400을 받기 전에 백엔드 PasswordValidator와 같은 규칙으로 먼저 거른다.
    const passwordError = getPasswordError(newPassword, email.trim());
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await resetPassword({ email: email.trim(), code, newPassword });
      // 재설정에 성공하면 서버가 기존 refresh token을 지우므로 새 비밀번호로 다시 로그인해야 한다.
      navigate('/login', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, '비밀번호 변경에 실패했습니다.'));
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
            title="비밀번호 찾기"
            description="이메일을 입력해 주세요."
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
            title="비밀번호 찾기"
            description="이름을 입력해 주세요."
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

        {step === 'password' && (
          <AuthCard
            topOffset={72}
            title="새 비밀번호를 입력해주세요."
            footer={
              <StepNavButtons
                onNext={handleSubmit}
                nextLabel="확인"
                isSubmit
                disabled={isLoading}
              />
            }
          >
            <AuthTextField
              type="password"
              placeholder="새 비밀번호를 입력해주세요"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />

            <p className="mt-[12px] w-[596px] text-[16px] font-medium leading-[24px] text-[#9DA1AC]">
              영문 대/소문자, 숫자, 특수문자를 사용하여 8~16자로 설정해 주세요. 쉬운 비밀번호나 다른
              사이트에서 사용한 비밀번호, 도용된 비밀번호는 사용하지 않도록 주의해 주세요.
            </p>

            <ErrorText message={error} />
          </AuthCard>
        )}
      </div>
    </div>
  );
}

function ErrorText({ message }: { message: string }) {
  if (!message) return null;
  return <p className="mt-[12px] text-[14px] font-medium leading-[20px] text-[#FF4D4F]">{message}</p>;
}
