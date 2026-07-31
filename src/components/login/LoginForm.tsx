import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import Button from '../Button/Button';
import { login } from '../../api/login/auth';
import { useUserStore } from '../../store/user/user';
import { tokenStorage } from '../../utils/token';
import type { ApiResponse } from '../../types/api';

// 로그인 폼: 이메일/비밀번호 입력 → 기본 로그인 API 호출 → 토큰/유저 저장 → 온보딩 여부로 이동
export default function LoginForm() {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const data = await login({ email, password });
      // 1. 토큰 저장 (이후 axios 요청 인터셉터가 자동으로 Bearer 첨부)
      tokenStorage.setTokens(data.accessToken, data.refreshToken, data.user.userId);
      // 2. 유저 정보 전역 저장
      setUser(data.user);
      // 3. 온보딩 완료 여부에 따라 이동 (미완료면 온보딩으로)
      navigate(data.user.onboardingCompleted ? '/' : '/onboarding');
    } catch (error) {
      // 4. 실패 메시지 표시 (백엔드 ApiResponse.message: 예 "이메일 또는 비밀번호가 일치하지 않습니다.")
      const message =
        isAxiosError<ApiResponse<null>>(error) && error.response?.data?.message
          ? error.response.data.message
          : '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[24px]">
        <h1 className="text-[28px] leading-[40px] font-bold tracking-[-0.01em] text-center text-[#0A0C11]">
          로그인
        </h1>

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          className="h-[64px] px-[24px] py-[12px] bg-[#F3F4F6] rounded-lg text-base font-medium text-[#0A0C11] placeholder:text-[#747883] outline-none"
        />

        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          className="h-[64px] px-[24px] py-[12px] bg-[#F3F4F6] rounded-lg text-base font-medium text-[#0A0C11] placeholder:text-[#747883] outline-none"
        />

        {/* 로그인 실패 안내 문구 */}
        {errorMessage && (
          <p className="text-sm font-medium text-[#FF4D4F]">{errorMessage}</p>
        )}

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          weight="bold"
          width="100%"
          disabled={isSubmitting}
          className="!bg-[linear-gradient(139deg,#7962ED_30%,#BDB9F9_100%)]"
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        {/* TODO: 비밀번호 재설정 화면이 아직 없어서 비워둠. 화면 생기면 연결
            (API는 src/api/login/password.ts에 준비돼 있음) */}
        <button type="button" className="text-base font-medium text-[#747883] underline">
          아이디/비밀번호 찾기
        </button>
        <button
          type="button"
          onClick={() => navigate('/sign')}
          className="text-base font-medium text-[#747883] underline"
        >
          회원가입
        </button>
      </div>
    </form>
  );
}
