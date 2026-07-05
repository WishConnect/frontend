import backArrow from '../../../assets/back-arrow.svg';

interface BackButtonProps {
  onClick?: () => void;
}

// 이전으로 돌아가기 버튼 — 상세 페이지 헤더에 사용
export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-[8px]"
    >
      {/* 화살표 아이콘 — 18x18px */}
      <img src={backArrow} alt="" className="shrink-0 size-[18px]" />
      {/* 텍스트 — Pretendard Medium 14px, #555964, 고정너비 103px */}
      <p className="shrink-0 whitespace-nowrap font-medium text-[14px] leading-[20px] text-[#555964]">
        이전으로 돌아가기
      </p>
    </button>
  );
}
