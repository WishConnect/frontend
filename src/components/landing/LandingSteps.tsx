import type { ReactNode } from 'react';
import RevealOnScroll from './RevealOnScroll';

/**
 * 이용 흐름 섹션 (Figma 1175:1546 맨 아래).
 * 원형 아이콘 4개를 화살표로 잇고, 그 아래 단계 이름과 설명을 둔다.
 *
 * 시안 아이콘은 SF Symbols라 그대로 쓸 수 없어 같은 모양의 인라인 SVG로 옮겼다.
 */
export default function LandingSteps() {
    return (
        <section className="w-full min-w-[1440px] pb-[350px] pt-[576px]">
            <RevealOnScroll>
                <h2 className="text-center text-[36px] font-[700] leading-[48px] text-[#10131A]">
                    탐색부터 신청까지, <span className="text-[#7962ED]">4단계</span>로 간편하게
                </h2>
            </RevealOnScroll>

            <ol className="mt-[40px] flex items-start justify-center">
                {STEPS.map((step, index) => (
                    <RevealOnScroll as="li" key={step.title} order={index} className="flex items-start">
                        <div className="flex w-[299px] flex-col items-center">
                            <span className="flex size-[120px] items-center justify-center rounded-full bg-[#7962ED]">
                                {step.icon}
                            </span>
                            <h3 className="mt-[24px] text-[28px] font-[700] leading-[40px] text-[#10131A]">
                                {step.title}
                            </h3>
                            <p className="mt-[8px] text-center text-[20px] font-[500] leading-[28px] text-[#555964]">
                                {step.lines.map((line) => (
                                    <span key={line} className="block">
                                        {line}
                                    </span>
                                ))}
                            </p>
                        </div>

                        {/* 단계 사이 화살표. 마지막 단계 뒤에는 붙이지 않는다. */}
                        {index < STEPS.length - 1 && (
                            <span className="-ml-[24px] mt-[42px] shrink-0 text-[#7962ED]">
                                <ChevronRightIcon />
                            </span>
                        )}
                    </RevealOnScroll>
                ))}
            </ol>
        </section>
    );
}

interface Step {
    title: string;
    lines: string[];
    icon: ReactNode;
}

const STEPS: Step[] = [
    {
        title: '➊ 정보입력',
        lines: ['간단한 정보 입력으로', '나에게 맞는 장학금을 찾아요.'],
        icon: <PersonIcon />,
    },
    {
        title: '➋ 맞춤 장학금 추천',
        lines: ['AI가 조건에 맞는 장학금을', '추천해드려요.'],
        icon: <SearchIcon />,
    },
    {
        title: '➌ 작성 도움 받기',
        lines: ['자기소개서 작성, 서류 준비를', 'AI와 함께 쉽게 완성해요.'],
        icon: <MonitorIcon />,
    },
    {
        title: '➍ 신청 완료',
        lines: ['신청 전 체크리스트로 최종 점검 후', '제출까지 완료해요.'],
        icon: <CheckIcon />,
    },
];

function PersonIcon() {
    return (
        <svg width="56" height="56" viewBox="0 0 24 24" fill="white">
            <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
            <path d="M12 14c-4.42 0-8 2.24-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.76-3.58-5-8-5Z" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </svg>
    );
}

function MonitorIcon() {
    return (
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8" />
            <path d="M12 17v4" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 12.5 5.5 5.5L20 6.5" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg width="24" height="38" viewBox="0 0 24 38" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7 9 10 10L7 29" />
        </svg>
    );
}
