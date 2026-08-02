import { useCallback, useEffect, useState } from 'react';
import {
  checkEmailAvailable,
  sendVerificationCode,
  verifyEmailCode,
} from '../api/login/email';
import { getApiErrorMessage } from '../utils/apiError';

// 회원가입 이메일 인증의 진행 단계.
//   idle      아직 중복 확인 전
//   available 중복 확인 통과(가입 가능) → 인증코드를 보낼 수 있음
//   sent      인증코드 발송됨 → 코드 입력 대기
//   verified  인증 완료 → 이 상태여야만 회원가입 API가 통과한다
export type EmailVerificationStep = 'idle' | 'available' | 'sent' | 'verified';

// 안내문구는 색이 달라야 해서 성격을 같이 들고 다닌다.
export interface StatusMessage {
  text: string;
  tone: 'info' | 'success' | 'error';
}

// 서버 application.yml의 cooldown-seconds와 같은 값. 이 시간 안에 재발송하면 429가 난다.
const RESEND_COOLDOWN_SECONDS = 60;

// 이메일 형식만 간단히 확인(최종 판정은 서버 @Email이 한다).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 회원가입 이메일 인증(중복확인 → 코드발송 → 코드확인)의 상태와 동작을 모아둔 훅.
 * 이메일을 다시 고치면 앞서 받은 인증이 무효가 되도록 단계를 처음으로 되돌린다.
 */
export function useEmailVerification(email: string) {
  const [step, setStep] = useState<EmailVerificationStep>('idle');
  const [emailMessage, setEmailMessage] = useState<StatusMessage | null>(null);
  const [codeMessage, setCodeMessage] = useState<StatusMessage | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0); // 인증코드 남은 유효시간(초)
  const [resendCooldown, setResendCooldown] = useState(0); // 재발송까지 남은 시간(초)
  const [isLoading, setIsLoading] = useState(false);

  // 이메일이 바뀌면 이전 이메일로 받은 인증은 의미가 없으므로 전부 초기화한다.
  // (A로 인증해두고 B로 고쳐서 가입하는 걸 막는다)
  // useEffect가 아니라 렌더 중에 비교해서 되돌리는 React 권장 방식.
  // effect로 하면 "인증됨" 상태가 한 번 그려진 뒤에 초기화돼 화면이 깜빡인다.
  const [lastEmail, setLastEmail] = useState(email);
  if (lastEmail !== email) {
    setLastEmail(email);
    setStep('idle');
    setEmailMessage(null);
    setCodeMessage(null);
    setSecondsLeft(0);
    setResendCooldown(0);
  }

  // 유효시간·쿨다운을 1초씩 줄인다. 둘 다 0이면 타이머를 걸지 않는다.
  useEffect(() => {
    if (secondsLeft <= 0 && resendCooldown <= 0) return;

    const timerId = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [secondsLeft, resendCooldown]);

  // 1) 이메일 중복 확인
  const checkEmail = useCallback(async () => {
    if (!EMAIL_PATTERN.test(email)) {
      setEmailMessage({ text: '이메일 형식을 확인해 주세요.', tone: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const available = await checkEmailAvailable(email);
      if (available) {
        setStep('available');
        setEmailMessage({
          text: '사용할 수 있는 이메일이에요. 인증코드를 발송해 주세요.',
          tone: 'success',
        });
      } else {
        setStep('idle');
        setEmailMessage({ text: '이미 가입된 이메일입니다.', tone: 'error' });
      }
    } catch (error) {
      setEmailMessage({
        text: getApiErrorMessage(error, '이메일 확인 중 문제가 발생했습니다.'),
        tone: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  // 2) 인증코드 발송(최초 발송·재발송 공용)
  const sendCode = useCallback(async () => {
    setIsLoading(true);
    setCodeMessage(null);
    try {
      const expiresIn = await sendVerificationCode(email);
      setStep('sent');
      setSecondsLeft(expiresIn);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setEmailMessage({
        text: '인증코드를 보냈어요. 메일함을 확인해 주세요.',
        tone: 'info',
      });
    } catch (error) {
      // 429(쿨다운)면 서버 안내문구가 그대로 노출된다.
      setEmailMessage({
        text: getApiErrorMessage(error, '인증코드 발송에 실패했습니다.'),
        tone: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  // 3) 인증코드 확인
  const verifyCode = useCallback(
    async (code: string) => {
      if (!code.trim()) {
        setCodeMessage({ text: '인증코드를 입력해 주세요.', tone: 'error' });
        return;
      }

      setIsLoading(true);
      try {
        await verifyEmailCode(email, code.trim());
        setStep('verified');
        setSecondsLeft(0);
        setResendCooldown(0);
        setCodeMessage({ text: '이메일 인증이 완료되었어요.', tone: 'success' });
        setEmailMessage(null);
      } catch (error) {
        setCodeMessage({
          text: getApiErrorMessage(error, '인증코드 확인에 실패했습니다.'),
          tone: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [email],
  );

  return {
    step,
    emailMessage,
    codeMessage,
    secondsLeft,
    resendCooldown,
    isLoading,
    isVerified: step === 'verified',
    checkEmail,
    sendCode,
    verifyCode,
  };
}

// 남은 시간을 04:32 형태로 표시.
export function formatRemainingTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}
