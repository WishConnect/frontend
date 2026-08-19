import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import AuthCard from '../../components/findAccount/AuthCard';
import AuthTextField from '../../components/findAccount/AuthTextField';
import CodeInput from '../../components/findAccount/CodeInput';
import StepNavButtons from '../../components/findAccount/StepNavButtons';
import { requestPasswordReset, resetPassword, verifyPasswordResetCode } from '../../api/login/password';
import { getApiErrorMessage } from '../../utils/apiError';
import { getLoginIdError, normalizeLoginId } from '../../utils/loginId';
import { getPasswordError } from '../../utils/password';

// 비밀번호 재설정: Figma 2462:5148(아이디) / 5177(이메일) / 5259·5302(인증번호) / 5359(새 비밀번호)
//
// 2026-08-18 백엔드 개편(api-server ba7fcb8)에 맞춰 다시 짰다.
//   - 계정을 **아이디 + 이메일 조합**으로 특정한다. 그래서 시안의 아이디 단계를 되살렸다
//     (예전엔 아이디 = 이메일이라 같은 값을 두 번 받는 꼴이어서 합쳤었다).
//   - 반대로 **이름 단계는 뺐다.** 서버가 비밀번호 재설정에서 이름을 안 쓴다.
//     보내지도 않는 값을 입력받으면 "맞게 넣었는데 왜 안 되지"로 이어진다.
//   - 코드 검증 전용 API(/auth/password/verify)가 생겨 인증번호 단계에서 바로 확인한다.
//     통과하면 1회용 resetToken(300초)을 받아 마지막 단계에서 그것만 보낸다.
//   - 가입 여부는 서버에 묻지 않는다. 서버가 계정 존재 여부를 일부러 숨기는데 화면에서
//     "가입 이력이 없는 이메일이에요"를 띄우면 그게 그대로 계정 조회기가 된다.

type Step = 'loginId' | 'email' | 'code' | 'password';

const RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FindPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('loginId');
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState(''); // 코드 확인 통과 시 서버가 주는 1회용 토큰
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timerId = setInterval(() => setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timerId);
  }, [resendCooldown]);

  // 1단계: 아이디 형식만 본다. 서버까지 갔다가 400(INVALID_LOGIN_ID_FORMAT)을 받기 전에 거른다.
  const handleLoginIdNext = () => {
    const loginIdError = getLoginIdError(loginId);
    if (loginIdError) {
      setError(loginIdError);
      return;
    }
    setError('');
    setStep('email');
  };

  // 2단계: 이메일 형식 확인 후 재설정 코드 발송.
  const handleEmailNext = async () => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('이메일 형식을 확인해 주세요.');
      return;
    }
    await sendCode();
  };

  const sendCode = async () => {
    setIsLoading(true);
    setError('');
    try {
      await requestPasswordReset(normalizeLoginId(loginId), email.trim());
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setCode('');
      setStep('code');
    } catch (err) {
      setError(getApiErrorMessage(err, '인증코드 발송에 실패했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  // 3단계: 코드를 바로 검증하고 1회용 resetToken을 받는다.
  // 검사 대상을 인자로 받는다. CodeInput의 onComplete는 state 반영 전에 호출되므로
  // 여기서 code state를 읽으면 6자리를 다 채워도 5자리로 보인다.
  const handleCodeNext = async (submittedCode: string) => {
    if (submittedCode.length < 6) {
      setError('인증번호 6자리를 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      // 코드가 틀렸을 때와 아이디·이메일이 계정과 다를 때가 서버에서 같은 응답이라 안내도 하나다.
      const verified = await verifyPasswordResetCode(
        normalizeLoginId(loginId),
        email.trim(),
        submittedCode,
      );
      setResetToken(verified.resetToken);
      setStep('password');
    } catch (err) {
      setError(getApiErrorMessage(err, '인증에 실패했어요. 입력한 정보와 인증번호를 확인해 주세요.'));
    } finally {
      setIsLoading(false);
    }
  };

  // 4단계: 발급받은 토큰과 새 비밀번호로 실제 재설정.
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
      await resetPassword({ resetToken, newPassword });
      // 재설정에 성공하면 서버가 기존 refresh token을 지우므로 새 비밀번호로 다시 로그인해야 한다.
      navigate('/login', { replace: true });
    } catch (err) {
      // 토큰은 1회용에 300초 제한이라, 여기서 만료되면 인증번호부터 다시 받아야 한다.
      setError(getApiErrorMessage(err, '비밀번호 변경에 실패했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-[1440px] bg-white">
      <Header logoOnly />

      <div className="pt-[184px]">
        {step === 'loginId' && (
          <AuthCard
            title="비밀번호 재설정"
            description="아이디를 입력해 주세요."
            footer={<StepNavButtons onNext={handleLoginIdNext} disabled={isLoading} />}
          >
            <AuthTextField
              placeholder="아이디"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoginIdNext()}
            />
            <ErrorText message={error} />
          </AuthCard>
        )}

        {step === 'email' && (
          <AuthCard
            title="비밀번호 재설정"
            description="가입할 때 쓴 이메일을 입력해 주세요."
            footer={
              <StepNavButtons
                onPrev={() => {
                  setError('');
                  setStep('loginId');
                }}
                onNext={handleEmailNext}
                disabled={isLoading}
              />
            }
          >
            <div className="flex flex-col gap-[20px]">
              {/* 앞 단계에서 넣은 아이디는 확인용으로만 보여준다 */}
              <AuthTextField value={loginId} readOnlyLook />
              <AuthTextField
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailNext()}
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
                  setStep('email');
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
