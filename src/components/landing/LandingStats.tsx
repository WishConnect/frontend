import statBars from '../../assets/landing/stat-bars.png';
import statPeople from '../../assets/landing/stat-people.png';
import statSearch from '../../assets/landing/stat-search.png';
import RevealOnScroll from './RevealOnScroll';

// 오른쪽 통계 3개. 그림 크기가 제각각이라(막대그래프가 가장 큼) 시안 치수를 그대로 쓴다.
const STATS = [
    { image: statBars, width: 106, height: 132, lines: ['생활비・근로 장학금', '지원 확대'] },
    { image: statPeople, width: 110, height: 102, lines: ['장학금 신청자', '지속 증가'] },
    { image: statSearch, width: 120, height: 111, lines: ['교외 장학금 탐색 니즈', '지속 확대'] },
];

/**
 * 시장 현황 섹션 (Figma 1175:1546 하단의 어두운 카드).
 * 배경은 검정에 가까운 색에서 연보라로 넘어가는 대각선 그라디언트다.
 */
export default function LandingStats() {
    return (
        <section className="w-full min-w-[1440px]">
            {/* 어두운 카드는 배경이 아니라 내용이라 시안 크기(1312px)를 유지하고 가운데 정렬만 한다 */}
            {/* data-landing-dark: 고정 로고가 이 카드 위를 지날 때 흰색으로 바뀌게 하는 표시.
                카드 왼쪽 끝(화면 중앙-656px)이 로고 왼쪽과 정확히 같은 자리라 세로 겹침만 보면 된다. */}
            <div
                data-landing-dark
                className="mx-auto flex h-[560px] w-[1312px] items-center rounded-[16px] bg-[linear-gradient(135deg,#181C25_51%,#B4AFFF_100%)] px-[90px]"
            >
                {/* 시안 기준 폭은 395px이지만 실제 폰트로는 설명 두 번째 줄이 넘쳐 3줄이 된다.
                    줄바꿈 위치를 시안대로 유지하려고 폭만 조금 넓혔다. */}
                <RevealOnScroll className="w-[430px] shrink-0">
                    <h2 className="text-[48px] font-[700] leading-[64px] tracking-[-0.02em] text-white">
                        장학금 시장은
                        <br />
                        더 커지고 있습니다
                    </h2>
                    <p className="mt-[16px] text-[20px] font-[500] leading-[28px] text-white">
                        생활비•근로 장학금 확대, 신청자 증가와 함께
                        <br />
                        정보 탐색과 신청 준비의 필요성도 커지고 있습니다.
                    </p>
                </RevealOnScroll>

                <ul className="flex flex-1 justify-end gap-[80px]">
                    {STATS.map((stat, index) => (
                        <RevealOnScroll
                            as="li"
                            key={stat.lines[0]}
                            order={index}
                            className="flex w-[170px] flex-col items-center gap-[16px]"
                        >
                            {/* 그림 높이가 달라도 글자 줄은 같은 높이에서 시작하도록 아래쪽으로 정렬한다 */}
                            <div className="flex h-[132px] items-end">
                                <img
                                    src={stat.image}
                                    alt=""
                                    aria-hidden
                                    style={{ width: stat.width, height: stat.height }}
                                    className="object-contain"
                                />
                            </div>
                            <p className="text-center text-[20px] font-[700] leading-[28px] text-[#BDB9F9]">
                                {stat.lines.map((line) => (
                                    <span key={line} className="block">
                                        {line}
                                    </span>
                                ))}
                            </p>
                        </RevealOnScroll>
                    ))}
                </ul>
            </div>
        </section>
    );
}
