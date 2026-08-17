import hero3d from '../../assets/landing/hero-3d.png';
import RevealOnScroll from './RevealOnScroll';

/**
 * 랜딩 첫 화면 (Figma 1175:1493).
 * 화면 하나를 꽉 채우는 히어로 영역으로, 스크롤하면 아래 문제제기 섹션이 이어진다.
 *
 * 배경은 시안의 방사형 그라디언트를 그대로 옮겼다.
 * 중심이 화면 아래(104.54%) 바깥에 있어서 하단 중앙이 밝고 위로 갈수록 어두워진다.
 */
export default function LandingHero() {
    return (
        <section
            data-landing-dark
            className="relative h-[1024px] w-full min-w-[1440px] overflow-hidden bg-[radial-gradient(ellipse_74.85%_74.85%_at_50%_104.54%,#320095_0%,#10131A_100%)]"
        >
            {/* 3D 오브젝트는 1440 상자가 아니라 섹션(=화면 전체) 오른쪽에 붙인다.
                시안처럼 화면 오른쪽 끝에서 잘려 나가는 인상을 넓은 화면에서도 유지하기 위해서다.
                (상자에 묶어두면 넓은 화면에서 오브젝트 오른쪽에 빈 배경만 남는다)
                -95px는 시안 좌표에서 오브젝트가 프레임 밖으로 넘치는 만큼이다.

                내보낸 PNG가 검은 배경을 포함한 사각형이라 그냥 얹으면 배경 그라디언트 위에
                네모난 경계가 드러난다. mix-blend-screen으로 어두운 픽셀을 배경에 녹인다. */}
            <img
                src={hero3d}
                alt=""
                aria-hidden
                className="pointer-events-none absolute right-[-30px] top-[260px] h-[764px] w-[1145px] select-none mix-blend-screen"
            />

            {/* 문구는 1440px 상자가 아니라 화면 왼쪽을 기준으로 붙인다.
                3D 오브젝트가 화면 오른쪽 끝에 붙어 있어서, 문구도 같은 기준이어야 좌우 균형이 맞는다.
                왼쪽 여백 135px은 3D 오브젝트가 오른쪽 벽과 벌어진 실제 간격을 잰 값이다
                (이미지 PNG의 투명 여백 때문에 요소 좌표가 아니라 그림 속 오브젝트 끝을 재야 나온다).
                고정 로고(LandingTopLogo)도 같은 값이라 두 요소의 세로선이 나란해진다.
                글자는 시안(48px)보다 한 단계 키웠고, 줄바꿈을 유지하려고 블록 폭도 451 → 490px로 넓혔다.
                (시안에서 여기 있던 로고는 화면 고정이 필요해 LandingTopLogo로 옮겼다) */}
            {/* 문구는 화면에 처음부터 보이므로, RevealOnScroll이 곧바로 켜지면서 등장 효과가 된다.
                배지 → 제목·설명 → 기능 순으로 조금씩 늦게 나타난다. */}
            <div className="absolute left-[135px] top-[128px] flex w-[490px] flex-col gap-[48px]">
                <div className="flex flex-col gap-[8px]">
                    {/* 상단 배지 */}
                    <RevealOnScroll>
                        <div className="flex items-center gap-[16px]">
                            <SparklesIcon />
                            <span className="text-[22px] font-[500] leading-[30px] text-[#BDB9F9]">
                                AI 기반 장학금 통합 플랫폼
                            </span>
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll order={1}>
                        <div className="flex flex-col gap-[24px]">
                            <h1 className="text-[52px] font-[700] leading-[70px] tracking-[-0.02em] text-white">
                                장학금 탐색부터
                                <br />
                                신청 준비까지,
                                <br />
                                전 과정을 <span className="text-[#7962ED]">쉽고 편리하게!</span>
                            </h1>
                            <p className="text-[22px] font-[500] leading-[30px] text-[#9DA1AC]">
                                흩어진 장학금 정보를 한 곳에서 찾고,
                                <br />
                                신청 준비까지 위시커넥트가 도와드릴게요.
                            </p>
                        </div>
                    </RevealOnScroll>
                </div>

                {/* 핵심 기능 3줄 */}
                <RevealOnScroll order={2}>
                    <ul className="flex flex-col gap-[24px]">
                        {HERO_FEATURES.map((feature) => (
                            <li key={feature.label} className="flex items-center gap-[12px]">
                                <span className="flex size-[32px] shrink-0 items-center justify-center rounded-[8px] bg-[#7962ED]">
                                    {feature.icon}
                                </span>
                                <span className="text-[17px] font-[500] leading-[26px] text-[#BDB9F9]">
                                    {feature.label}
                                </span>
                            </li>
                        ))}
                    </ul>
                </RevealOnScroll>
            </div>

            {/* 시안에서 화면 하단에 있던 "위시커넥트 시작하기" 버튼은
                스크롤과 무관하게 떠 있어야 해서 LandingStartButton으로 옮겼다. */}
        </section>
    );
}

// 아이콘은 시안이 lucide 세트를 쓰고 있어 같은 모양으로 인라인 SVG를 넣었다.
// 색은 currentColor 대신 시안 값(#F4F4FE)을 그대로 지정한다.
const HERO_FEATURES = [
    { label: 'AI 맞춤 추천', icon: <SparkleBadgeIcon /> },
    { label: '신청 관리', icon: <ClipboardPenIcon /> },
    { label: '장학금 인사이트', icon: <LightbulbIcon /> },
];

function SparklesIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BDB9F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
        </svg>
    );
}

function SparkleBadgeIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4F4FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
        </svg>
    );
}

function ClipboardPenIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4F4FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="8" height="4" x="8" y="2" rx="1" />
            <path d="M10.4 12.6a2 2 0 0 1 3 3L8 21l-4 1 1-4z" />
            <path d="M16 4h2a2 2 0 0 1 2 2v3" />
            <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
        </svg>
    );
}

function LightbulbIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4F4FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
        </svg>
    );
}

