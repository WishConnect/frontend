import type { ReactNode } from 'react';

// 계정 찾기(아이디/비밀번호) 화면 공용 카드
// Figma 2462:4599 기준: 774x496, radius 24, 1px 테두리(#D2D4DA).
// 내부는 좌우 89px 여백 안에 596px 콘텐츠가 들어가고, 버튼은 카드 하단에 절대 배치된다.
interface AuthCardProps {
  title: string; // 줄바꿈이 필요한 제목은 \n 을 넣으면 된다(whitespace-pre-line)
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  // 버튼 묶음 위치. 기본은 우측 하단(이전/다음), 결과 화면처럼 가로 꽉 채울 땐 caller가 덮어쓴다.
  footerClassName?: string;
  // 제목 상단 여백. 1줄 제목은 64px, 2줄 제목·결과 화면은 72px (Figma 실측)
  topOffset?: number;
}

export default function AuthCard({
  title,
  description,
  children,
  footer,
  footerClassName = 'absolute bottom-[44px] right-[57px]',
  topOffset = 64,
}: AuthCardProps) {
  return (
    <div className="relative mx-auto h-[496px] w-[774px] rounded-[24px] border border-[#D2D4DA] bg-white">
      <div className="absolute left-[89px] w-[596px]" style={{ top: `${topOffset}px` }}>
        <h1 className="whitespace-pre-line text-[28px] font-bold leading-[40px] tracking-[-0.01em] text-[#10131A]">
          {title}
        </h1>

        {description && (
          <p className="mt-[4px] whitespace-pre-line text-[16px] font-medium leading-[24px] text-[#555964]">
            {description}
          </p>
        )}

        {/* 제목/설명과 입력 영역 사이 36px (Figma: 설명 하단 396 → 입력 상단 432) */}
        <div className="mt-[36px]">{children}</div>
      </div>

      {footer && <div className={footerClassName}>{footer}</div>}
    </div>
  );
}
