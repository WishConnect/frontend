import aiMock from '../../assets/landing/feature-ai-mock.png';
import manageMock from '../../assets/landing/feature-manage-mock.png';
import insightChat from '../../assets/landing/feature-insight-chat.png';
import insightTags from '../../assets/landing/feature-insight-tags.png';
import RevealOnScroll from './RevealOnScroll';

// 카드 3장이 같은 모양이라 클래스를 한 곳에 모아둔다. 마우스를 올리면 살짝 떠오른다.
const FEATURE_CARD_CLASS =
    'relative h-[412px] w-[359px] overflow-hidden rounded-[16px] bg-[#F4F4FE] hover:-translate-y-[6px] hover:duration-300';

/**
 * 기능 소개 섹션 (Figma 1175:1546 중단).
 * 위 섹션에서 내려오는 연결선(점 + 세로선)으로 시작해 카드 3장을 보여준다.
 *
 * 카드 안의 화면 목업은 시안에서 그대로 내보낸 그림이다.
 * 텍스트가 아니라 "이런 화면이 있다"는 장식이라 코드로 다시 그리지 않았다.
 */
// 위·아래 여백(pt-208 / pb-484)은 시안의 섹션 간 좌표를 그대로 옮긴 값이다.
export default function LandingFeatures() {
    return (
        <section className="relative w-full min-w-[1440px] pb-[484px]">
            {/* 위 섹션과 이어지는 연결선. 선 끝에 점이 붙는다.
                화면 폭이 넓어져도 가운데를 따라가야 해서 left-1/2 기준으로 잡았다. */}
            <div className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center">
                <span className="h-[158px] w-px bg-[#7962ED]/50" />
                <span className="size-[20px] rounded-full bg-[#7962ED]/50" />
            </div>

            <RevealOnScroll className="pt-[208px]">
                <h2 className="text-center text-[36px] font-[700] leading-[48px] text-[#10131A]">
                    위시커넥트는 장학금 준비 과정을 <span className="text-[#7962ED]">더 쉽게</span> 만듭니다
                </h2>
            </RevealOnScroll>

            <ul className="mt-[40px] flex justify-center gap-[28px]">
                {/* AI 맞춤 추천 */}
                <RevealOnScroll as="li" className={FEATURE_CARD_CLASS}>
                    <FeatureHeading
                        title="AI 맞춤 추천"
                        lines={['내 정보와 관심사를 분석해', '나에게 꼭 맞는 장학금을 추천해요.']}
                    />
                    <img src={aiMock} alt="" aria-hidden className="absolute left-[20px] top-[196px] h-[196px] w-[319px]" />
                </RevealOnScroll>

                {/* 신청 관리 */}
                <RevealOnScroll as="li" order={1} className={FEATURE_CARD_CLASS}>
                    <FeatureHeading
                        title="신청 관리"
                        lines={['신청 일정부터 작성 도움, 서류 준비까지', '한 번에 관리할 수 있어요.']}
                    />
                    <img src={manageMock} alt="" aria-hidden className="absolute left-[29px] top-[200px] h-[192px] w-[301px]" />
                </RevealOnScroll>

                {/* 장학금 인사이트: 태그 줄이 카드 왼쪽 밖으로 살짝 걸쳐 있는 시안이라 위치를 그대로 옮겼다 */}
                <RevealOnScroll as="li" order={2} className={FEATURE_CARD_CLASS}>
                    <FeatureHeading
                        title="장학금 인사이트"
                        lines={['흩어져 있는 웹상의 후기와 정보를 모아', '장학금 지원에 필요한 인사이트를 제공해요.']}
                    />
                    <img src={insightTags} alt="" aria-hidden className="absolute left-[-9px] top-[162px] h-[26px] w-[377px]" />
                    <img src={insightChat} alt="" aria-hidden className="absolute left-[29px] top-[220px] h-[172px] w-[301px]" />
                </RevealOnScroll>
            </ul>
        </section>
    );
}

interface FeatureHeadingProps {
    title: string;
    lines: string[];
}

// 카드 상단의 제목 + 설명. 세 카드가 같은 위치·같은 정렬이라 따로 뺐다.
function FeatureHeading({ title, lines }: FeatureHeadingProps) {
    return (
        <div className="absolute left-0 top-[45px] w-full px-[20px] text-center">
            <h3 className="text-[28px] font-[700] leading-[40px] text-[#10131A]">{title}</h3>
            <p className="mt-[8px] text-[14px] font-[500] leading-[20px] text-[#555964]">
                {lines.map((line) => (
                    <span key={line} className="block">
                        {line}
                    </span>
                ))}
            </p>
        </div>
    );
}
