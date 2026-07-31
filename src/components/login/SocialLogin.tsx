import { useState } from 'react';
import kakaoIcon from '../../assets/social/kakao.svg';
import naverIcon from '../../assets/social/naver.svg';
import googleIcon from '../../assets/social/google.png';
import { buildAuthorizeUrl } from '../../utils/oauth';
import type { SocialProvider } from '../../utils/oauth';

const SOCIAL_PROVIDERS: { id: SocialProvider; name: string; icon: string }[] = [
  { id: 'kakao', name: '카카오', icon: kakaoIcon },
  { id: 'naver', name: '네이버', icon: naverIcon },
  { id: 'google', name: '구글', icon: googleIcon },
];

// 간편 로그인: 구분선 + 카카오/네이버/구글 버튼
// 클릭하면 해당 제공자의 인가 페이지로 이동하고, 로그인 후 /auth/{provider}/callback 으로 돌아온다.
export default function SocialLogin() {
  const [errorMessage, setErrorMessage] = useState('');

  const handleClick = (provider: SocialProvider) => {
    setErrorMessage('');
    try {
      // 외부 사이트(카카오 등)로 나가는 이동이라 react-router가 아닌 브라우저 이동을 쓴다.
      window.location.assign(buildAuthorizeUrl(provider));
    } catch (error) {
      // Client ID 미설정 등 준비가 안 된 경우 사용자에게 알린다.
      setErrorMessage(error instanceof Error ? error.message : '로그인을 시작할 수 없습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-[48px]">
      <div className="flex items-center gap-[16px] self-stretch">
        <div className="w-[245px] h-0 border-t border-[#9DA1AC]" />
        <span className="shrink-0 text-base font-medium text-center text-[#747883]">
          간편 로그인
        </span>
        <div className="w-[245px] h-0 border-t border-[#9DA1AC]" />
      </div>

      <div className="flex flex-col items-center gap-[16px]">
        <div className="flex items-center gap-[60px]">
          {SOCIAL_PROVIDERS.map(({ id, name, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleClick(id)}
              className="flex flex-col items-center gap-[10px]"
            >
              <img src={icon} alt={name} className="size-[64px] rounded-full" />
              <span className="text-[14px] leading-[20px] font-medium text-center text-[#555964]">
                {name}로 로그인
              </span>
            </button>
          ))}
        </div>

        {/* 소셜 로그인 시작 실패 안내 (예: Client ID 미설정) */}
        {errorMessage && (
          <p className="text-sm font-medium text-[#FF4D4F]">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
