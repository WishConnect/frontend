import problemBg from '../../assets/landing/problem-bg.jpg';
import iconFolder from '../../assets/landing/problem-icon-folder.png';
import iconClock from '../../assets/landing/problem-icon-clock.png';
import iconStar from '../../assets/landing/problem-icon-star.png';
import RevealOnScroll from './RevealOnScroll';

// 문제 카드 3장. 아이콘은 그라디언트가 들어간 그림이라 벡터로 옮기지 않고 시안에서 내보낸 PNG를 쓴다.
const PROBLEMS = [
    {
        icon: iconFolder,
        iconWidth: 55,
        title: '흩어진 정보',
        lines: ['학교, 재단, 기업 등', '다양한 곳에 흩어진 장학금 정보를', '일일이 찾아야 해요.'],
    },
    {
        icon: iconClock,
        iconWidth: 44,
        title: '복잡한 준비',
        lines: ['긴 공고문 해석, 자기소개서 작성', '서류 준비까지 신경 쓸 것이', '너무 많아요.'],
    },
    {
        icon: iconStar,
        iconWidth: 46,
        title: '놓치는 기회',
        lines: ['신청 기간을 놓치거나, 나에게', '맞는 장학금을 발견하기 어려워', '기회를 놓치게 돼요.'],
    },
];

/**
 * 문제 제기 섹션 (Figma 1175:1546 상단).
 * 어두운 사진 위에 반투명 카드 3장을 얹고, 아래쪽은 곡선으로 잘라 다음 섹션과 이어지게 한다.
 */
export default function LandingProblem() {
    return (
        <section data-landing-dark className="relative h-[992px] w-full min-w-[1440px]">
            {/* 배경 사진 + 어둡게 덮는 레이어. 화면 폭을 꽉 채우고 사진은 잘라서 채운다(object-cover).
                하단을 타원으로 깎아 가운데가 아래로 볼록한 시안의 곡선을 만든다. */}
            <div className="absolute inset-0 overflow-hidden rounded-b-[50%_48px]">
                <img src={problemBg} alt="" aria-hidden className="size-full object-cover" />
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* 제목은 화면 전체 기준 가운데, 카드는 1440px 기준 좌표를 쓰므로 가운데 상자 안에 둔다 */}
            <RevealOnScroll className="absolute left-0 top-[300px] w-full">
                <h2 className="text-center text-[36px] font-[700] leading-[48px] text-white">
                    장학금, 왜 이렇게 찾기 어렵고 준비는 번거로울까요?
                </h2>
            </RevealOnScroll>

            {/* 카드는 왼쪽부터 차례로 나타난다(order 0·1·2) */}
            <ul className="absolute left-1/2 top-[392px] flex -translate-x-1/2 gap-[28px]">
                {PROBLEMS.map((problem, index) => (
                    <RevealOnScroll
                        key={problem.title}
                        as="li"
                        order={index}
                        className="flex h-[250px] w-[359px] flex-col items-center justify-center gap-[24px] rounded-[16px] bg-white/15 px-[24px] hover:-translate-y-[6px] hover:duration-300"
                    >
                        <div className="flex items-center gap-[12px]">
                            <img src={problem.icon} alt="" aria-hidden style={{ width: problem.iconWidth }} className="h-[44px] object-contain" />
                            <span className="text-[28px] font-[700] leading-[40px] text-[#BDB9F9]">{problem.title}</span>
                        </div>
                        <p className="text-center text-[20px] font-[500] leading-[28px] text-white">
                            {problem.lines.map((line) => (
                                <span key={line} className="block">
                                    {line}
                                </span>
                            ))}
                        </p>
                    </RevealOnScroll>
                ))}
            </ul>
        </section>
    );
}
