import type { ReactNode } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

// 여러 개를 차례로 등장시킬 때 쓰는 지연값. 인라인 style 대신 클래스로 두는 건 팀 규칙(Tailwind만 사용) 때문이다.
const DELAY_CLASS = ['delay-0', 'delay-150', 'delay-300', 'delay-500'] as const;

interface RevealOnScrollProps {
    children: ReactNode;
    /** 0~3. 같은 줄에 여러 개가 있을 때 순서대로 나타나게 한다. */
    order?: number;
    /** 감쌀 태그. 목록 안에서는 'li'로 줘야 ul/ol 마크업이 어긋나지 않는다. */
    as?: 'div' | 'li';
    className?: string;
}

/**
 * 화면에 들어오면 아래에서 살짝 떠오르며 나타나는 껍데기.
 * 랜딩의 제목·카드처럼 "스크롤하다 만나는" 요소를 감싸서 쓴다.
 */
export default function RevealOnScroll({
    children,
    order = 0,
    as: Tag = 'div',
    className = '',
}: RevealOnScrollProps) {
    const { ref, isVisible } = useScrollReveal<HTMLDivElement & HTMLLIElement>();
    const delay = DELAY_CLASS[Math.min(order, DELAY_CLASS.length - 1)];

    return (
        <Tag
            ref={ref}
            className={`transition-all duration-700 ease-out ${delay} ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[24px] opacity-0'
            } ${className}`}
        >
            {children}
        </Tag>
    );
}
