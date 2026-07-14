import kakaoIcon from '../../assets/social/kakao.svg';
import naverIcon from '../../assets/social/naver.svg';
import googleIcon from '../../assets/social/google.png';

const SOCIAL_PROVIDERS = [
  { name: '카카오', icon: kakaoIcon },
  { name: '네이버', icon: naverIcon },
  { name: '구글', icon: googleIcon },
];

// 간편 로그인: 구분선 + 카카오/네이버/구글 버튼
export default function SocialLogin() {
  return (
    <div className="flex flex-col items-center gap-[48px]">
      <div className="flex items-center gap-[16px] self-stretch">
        <div className="w-[245px] h-0 border-t border-[#9DA1AC]" />
        <span className="shrink-0 text-base font-medium text-center text-[#747883]">
          간편 로그인
        </span>
        <div className="w-[245px] h-0 border-t border-[#9DA1AC]" />
      </div>

      <div className="flex items-center gap-[60px]">
        {SOCIAL_PROVIDERS.map(({ name, icon }) => (
          <button
            key={name}
            type="button"
            className="flex flex-col items-center gap-[10px]"
          >
            <img src={icon} alt={name} className="size-[64px] rounded-full" />
            <span className="text-[14px] leading-[20px] font-medium text-center text-[#555964]">
              {name}로 로그인
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
