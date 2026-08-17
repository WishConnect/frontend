interface LandingStartButtonProps {
    /** 누르면 페이지가 사라지는 연출을 시작한다. 실제 이동은 LandingPage가 맡는다. */
    onStart: () => void;
}

/**
 * 화면 하단에 고정되는 "위시커넥트 시작하기" 버튼.
 *
 * 시안에서는 첫 화면 안에 놓여 있지만(1440x1024 기준 top 916px = 아래에서 32px),
 * 스크롤해도 계속 보이도록 fixed로 띄운다. 크기·색은 시안 그대로다.
 *
 * 누르면 홈으로 간다. 홈이 로그인 여부에 따라 알아서 갈리므로
 * 여기서 회원가입/로그인을 따로 판단하지 않는다.
 */
export default function LandingStartButton({ onStart }: LandingStartButtonProps) {
    return (
        <button
            type="button"
            onClick={onStart}
            className="fixed bottom-[64px] left-1/2 z-50 flex h-[76px] w-[569px] -translate-x-1/2 items-center justify-center gap-[12px] rounded-[16px] bg-[#7962ED] text-[28px] font-[700] leading-[40px] text-white shadow-[0_8px_24px_rgba(16,19,26,0.24)] transition-[background-color,box-shadow] duration-200 hover:bg-[#6a52e0] hover:shadow-[0_12px_32px_rgba(121,98,237,0.45)]"
        >
            위시커넥트 시작하기
            <ArrowRightIcon />
        </button>
    );
}

function ArrowRightIcon() {
    return (
        <svg width="29" height="29" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}
