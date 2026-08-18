import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import Button from '../Button/Button';
import { login } from '../../api/login/auth';
import { useUserStore } from '../../store/user/user';
import { tokenStorage } from '../../utils/token';
import { getLoginIdError, normalizeLoginId } from '../../utils/loginId';
import type { ApiResponse } from '../../types/api';

// 로그인 폼: 아이디/비밀번호 입력 → 기본 로그인 API 호출 → 토큰/유저 저장 → 온보딩 여부로 이동
// ⚠️ 2026-08-18 백엔드가 기본 로그인을 이메일 → 아이디 기준으로 바꿨다(api-server ba7fcb8).
export default function LoginForm() {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 서버까지 갔다가 400(INVALID_LOGIN_ID_FORMAT)을 받기 전에 같은 규칙으로 먼저 거른다.
    // 이메일을 그대로 입력한 경우가 여기서 걸린다(@ 와 점은 아이디에 못 쓴다).
    const loginIdError = getLoginIdError(loginId);
    if (loginIdError) {
      setErrorMessage(loginIdError);
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      // 서버도 trim + 소문자로 낮춰 조회하므로 같은 값으로 맞춰 보낸다.
      const data = await login({ loginId: normalizeLoginId(loginId), password });
      // 1. 토큰 저장 (이후 axios 요청 인터셉터가 자동으로 Bearer 첨부)
      tokenStorage.setTokens(data.accessToken, data.refreshToken, data.user.userId);
      // 2. 유저 정보 전역 저장
      setUser(data.user);
      // 3. 온보딩 완료 여부에 따라 이동 (미완료면 온보딩으로)
      navigate(data.user.onboardingCompleted ? '/' : '/onboarding');
    } catch (error) {
      // 4. 실패 메시지 표시 (백엔드 ApiResponse.message: 예 "아이디 또는 비밀번호가 일치하지 않습니다.")
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

        {/* 아이디 입력. type="email"이면 브라우저가 @ 없는 값을 막아버려 아이디를 못 넣는다. */}
        <input
          type="text"
          required
          autoComplete="username"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          placeholder="아이디"
          className="h-[64px] px-[24px] py-[12px] bg-[#F3F4F6] rounded-lg text-base font-medium text-[#0A0C11] placeholder:text-[#747883] outline-none"
        />

        <input
          type="password"
          required
          autoComplete="current-password"
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
        {/* 아이디 찾기 · 비밀번호 찾기 (Figma 1314:2713, 3px 점으로 구분)
            아이디 찾기는 2026-08-16에 보안 문제로 잠시 내렸다가 2026-08-17에 되살렸다.
            아이디와 이메일이 별개 값이 됐고(users.login_id 신설) 이메일 인증을 통과해야
            결과가 나오므로, 내렸던 사유(본인 확인 없이 이메일이 노출됨)가 해소됐다. */}
        <div className="flex items-center gap-[12px]">
          <button
            type="button"
            onClick={() => navigate('/find-id')}
            className="text-base font-medium text-[#747883] underline"
          >
            아이디 찾기
          </button>
          <span className="size-[3px] rounded-full bg-[#747883]" />
          <button
            type="button"
            onClick={() => navigate('/find-password')}
            className="text-base font-medium text-[#747883] underline"
          >
            비밀번호 찾기
          </button>
        </div>

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
