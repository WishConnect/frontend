import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { googleLogin, kakaoLogin } from '../../api/login/social';
import { useUserStore } from '../../store/user/user';
import { tokenStorage } from '../../utils/token';
import { consumeStoredState, getRedirectUri, PROVIDER_LABELS } from '../../utils/oauth';
import type { SocialProvider } from '../../utils/oauth';
import type { ApiResponse } from '../../types/api';
import type { SocialLoginResponseData } from '../../types/login/auth';

// 소셜 로그인 콜백 페이지 (/auth/:provider/callback)
// 제공자가 인가코드(code)를 쿼리로 붙여 돌려보내면, 그 code를 서버로 넘겨 우리 서비스 토큰을 받는다.
export default function SocialCallbackPage() {
  const navigate = useNavigate();
  const { provider } = useParams<{ provider: string }>();
  const [searchParams] = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);
  const [errorMessage, setErrorMessage] = useState('');

  // 인가코드는 1회용이라 중복 호출하면 두 번째부터 실패한다.
  // StrictMode(개발 모드)는 effect를 두 번 실행하므로 여기서 한 번만 돌도록 막는다.
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    const run = async () => {
      const code = searchParams.get('code');
      const returnedState = searchParams.get('state');
      // 사용자가 동의 화면에서 취소하면 code 대신 error가 붙어 돌아온다.
      const oauthError = searchParams.get('error');
      const storedState = consumeStoredState();

      const isSupported = (value?: string): value is SocialProvider =>
        value === 'kakao' || value === 'google';

      if (!isSupported(provider)) {
        setErrorMessage('지원하지 않는 로그인 방식입니다.');
        return;
      }

      if (oauthError) {
        setErrorMessage(`${PROVIDER_LABELS[provider]} 로그인이 취소되었습니다.`);
        return;
      }

      if (!code) {
        setErrorMessage('인가코드를 받지 못했습니다. 다시 시도해 주세요.');
        return;
      }

      // state 불일치는 위조된 요청일 수 있으므로 진행하지 않는다.
      if (!returnedState || returnedState !== storedState) {
        setErrorMessage('로그인 요청이 유효하지 않습니다. 다시 시도해 주세요.');
        return;
      }

      try {
        let data: SocialLoginResponseData;

        // 인가 URL을 만들 때와 똑같은 함수로 콜백 주소를 다시 만든다.
        // 같은 함수를 쓰므로 인가 시점의 값과 어긋날 수 없다(불일치 시 제공자가 토큰 교환을 거부).
        const redirectUri = getRedirectUri(provider);

        if (provider === 'kakao') {
          data = await kakaoLogin({ code, redirectUri });
        } else {
          data = await googleLogin({ code, redirectUri });
        }

        // 기본 로그인(LoginForm)과 동일하게 토큰/유저를 저장한다.
        tokenStorage.setTokens(data.accessToken, data.refreshToken, data.user.userId);
        setUser(data.user);

        // 신규 가입이거나 온보딩 미완료면 온보딩으로 보낸다.
        const needsOnboarding = data.isNewUser || !data.user.onboardingCompleted;
        navigate(needsOnboarding ? '/onboarding' : '/', { replace: true });
      } catch (error) {
        const message =
          isAxiosError<ApiResponse<null>>(error) && error.response?.data?.message
            ? error.response.data.message
            : '소셜 로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        setErrorMessage(message);
      }
    };

    void run();
  }, [navigate, provider, searchParams, setUser]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-[16px]">
      {errorMessage ? (
        <>
          <p className="text-base font-medium text-[#FF4D4F]">{errorMessage}</p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="text-base font-medium text-[#7962ED] underline"
          >
            로그인 페이지로 돌아가기
          </button>
        </>
      ) : (
        <p className="text-base font-medium text-[#747883]">로그인 중입니다...</p>
      )}
    </div>
  );
}
