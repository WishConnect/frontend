interface AuthButtonsProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

// 비로그인 상태 GNB에 노출되는 로그인/회원가입 버튼 묶음
export default function AuthButtons({ onLoginClick, onSignupClick }: AuthButtonsProps) {
  return (
    <div className="flex items-center gap-[8px]">
      <button
        type="button"
        onClick={onLoginClick}
        className="flex items-center justify-center w-[108px] h-[48px] px-[16px] py-[8px] rounded-lg bg-white border border-[#9DA1AC]"
      >
        <span className="font-semibold text-[16px] leading-[24px] text-[#555964]">로그인</span>
      </button>
      <button
        type="button"
        onClick={onSignupClick}
        className="flex items-center justify-center w-[108px] h-[48px] px-[16px] py-[8px] rounded-lg bg-[linear-gradient(109.4deg,#7962ED_30.662%,#BDB9F9_105.21%)]"
      >
        <span className="font-semibold text-[16px] leading-[24px] text-white">회원가입</span>
      </button>
    </div>
  );
}
