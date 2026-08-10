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

// 비밀번호 찾기: Figma 2462:5148(아이디) / 5177(이메일) / 5216(이름) / 5259·5302(인증번호) / 5359(새 비밀번호)
//
// ⚠️ 이 시스템에서 아이디 = 이메일이다(User 엔티티에 아이디 필드가 없고 로그인도 이메일로 한다).
//    시안은 아이디와 이메일을 다른 값으로 보고 단계를 나눠 놨지만 서버엔 그런 구분이 없어서,
//    2단계는 1단계에 넣은 값과 같은지 확인하는 "오타 방지 재입력"으로 구현했다.
//    이름 역시 서버 대조 API가 없어 입력 여부만 본다. → 단계 구성은 팀 확인 필요.
//
// ⚠️ 비밀번호 재설정에는 코드만 따로 검증하는 API가 없다.
//    (/auth/password/reset 이 email+code+newPassword를 한 번에 받는다)
//    그래서 인증번호는 4단계에서 받아두고 실제 검증은 5단계 "확인"에서 일어난다.

type Step = 'account' | 'email' | 'name' | 'code' | 'password';

const RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FindPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('account');
  const [accountId, setAccountId] = useState(''); // = 이메일
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

  // 1단계: 아이디(=이메일)가 실제로 가입된 계정인지 확인.
  // available=true면 그 이메일로 가입한 LOCAL 계정이 없다는 뜻이다.
  const handleAccountNext = async () => {
    if (!EMAIL_PATTERN.test(accountId.trim())) {
      setError('아이디는 가입할 때 쓴 이메일 주소예요. 이메일 형식으로 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const available = await checkEmailAvailable(accountId.trim());
      if (available) {
        setError('가입 이력이 없는 아이디예요. 다시 확인해 주세요.');
        return;
      }
      setStep('email');
    } catch (err) {
      setError(getApiErrorMessage(err, '아이디 확인 중 문제가 발생했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  // 2단계: 아이디와 같은 이메일인지 확인(오타 방지).
  const handleEmailNext = () => {
    if (email.trim().toLowerCase() !== accountId.trim().toLowerCase()) {
      setError('아이디로 입력한 이메일과 다릅니다. 다시 확인해 주세요.');
      return;
    }
    setError('');
    setStep('name');
  };

  // 3단계: 이름 입력 후 재설정 코드 발송.
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
      await requestPasswordReset(accountId.trim());
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setCode('');
      setStep('code');
    } catch (err) {
      setError(getApiErrorMessage(err, '인증코드 발송에 실패했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  // 4단계: 코드는 여기서 검증할 방법이 없어 형식만 보고 넘어간다(실제 검증은 5단계).
  const handleCodeNext = () => {
    if (code.length < 6) {
      setError('인증번호 6자리를 모두 입력해 주세요.');
      return;
    }
    setError('');
    setStep('password');
  };

  // 5단계: 코드 + 새 비밀번호를 함께 보내 실제 재설정.
  const handleSubmit = async () => {
    // 서버까지 갔다가 400을 받기 전에 백엔드 PasswordValidator와 같은 규칙으로 먼저 거른다.
    const passwordError = getPasswordError(newPassword, accountId.trim());
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await resetPassword({ email: accountId.trim(), code, newPassword });
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
        {step === 'account' && (
          <AuthCard
            title="비밀번호 찾기"
            description="아이디를 입력해 주세요."
            footer={<StepNavButtons onNext={handleAccountNext} disabled={isLoading} />}
          >
            <AuthTextField
              placeholder="아이디"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAccountNext()}
            />
            <ErrorText message={error} />
          </AuthCard>
        )}

        {step === 'email' && (
          <AuthCard
            title="비밀번호 찾기"
            description={`${accountId}의 이메일을 입력해 주세요.`}
            footer={
              <StepNavButtons
                onPrev={() => {
                  setError('');
                  setStep('account');
                }}
                onNext={handleEmailNext}
                disabled={isLoading}
              />
            }
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
            description={`${accountId}의 이름을 입력해 주세요.`}
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
