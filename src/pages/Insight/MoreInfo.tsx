import QnA from '../../assets/icons/QnA.svg';
import Search from '../../assets/icons/Search.svg';
import Check from '../../assets/icons/Check.svg';
import { referenceSections, checkListSection } from '../../data/referenceData';
import FaqDropdown from '../../components/FAQ/FaqDropDown';

const faqSection = referenceSections[0];
const guideSection = referenceSections[1];

export default function MoreInfoPage() {
  return (
    <div className="flex h-[1024px] w-[1440px] bg-white font-['Pretendard']">
      <header className="h-[80px]">{/* Header */}</header>
      <div className="mt-[32px] flex flex-col gap-[48px] w-[1440px] px-[109px] pb-[64px]">
        <div className="w-[486px] gap-[4px] flex flex-col">
          <span className="h-[48px] font-bold text-[36px] leading-[48px] text-[#10131A] ">
            참고하면 좋아요
          </span>
          <span className="h-[24px] font-medium text-[16px] leading-[24px] text-[#555964] ">
            장학금 준비에 도움이 되는 정보를 모았어요.
          </span>
        </div>
        <div className="box-border flex h-[1916px] w-[1222px] flex-col gap-[32px] pb-[64px]">
          <article className="rounded-[16px] flex flex-col border border-[#D2D4DA] w-[1222px] px-[48px] py-[36px] gap-[36px]">
            <div className="flex h-[80px] gap-[24px]">
              <img src={QnA} className="h-[80px] w-[80px]" />

              <div className="flex flex-col justify-center gap-[8px]">
                <div className="flex items-center gap-[8px]">
                  <span className="text-[20px] font-semibold leading-[28px] text-[#7962ED]">
                    {faqSection.id}
                  </span>

                  <span className="text-[20px] font-semibold leading-[28px] text-[#10131A]">
                    {faqSection.title}
                  </span>
                </div>

                <span className="text-[16px] font-medium leading-[24px] text-[#747883]">
                  {faqSection.description}
                </span>
              </div>
            </div>
            {/* 질문 목록 */}
            <div className="flex flex-col">
              {faqSection.items.map((item) => (
                <FaqDropdown key={item.id} question={item.question} answer={item.answer} />
              ))}
            </div>
          </article>
          <article className="rounded-[16px] flex flex-col border border-[#D2D4DA] w-[1222px] px-[48px] py-[36px] gap-[36px]">
            <div className="flex h-[80px] gap-[24px]">
              <img src={Search} className="h-[80px] w-[80px]" />

              <div className="flex flex-col justify-center gap-[8px]">
                <div className="flex items-center gap-[8px]">
                  <span className="text-[20px] font-semibold leading-[28px] text-[#7962ED]">
                    {guideSection.id}
                  </span>

                  <span className="text-[20px] font-semibold leading-[28px] text-[#10131A]">
                    {guideSection.title}
                  </span>
                </div>

                <span className="text-[16px] font-medium leading-[24px] text-[#747883]">
                  {guideSection.description}
                </span>
              </div>
            </div>
            {/* 질문 목록 */}
            <div className="flex flex-col">
              {guideSection.items.map((item) => (
                <FaqDropdown key={item.id} question={item.question} answer={item.answer} />
              ))}
            </div>
          </article>
          <article className="rounded-[16px] flex flex-col border border-[#D2D4DA] w-[1222px] px-[48px] py-[36px] gap-[36px]">
            <div className="flex h-[80px] gap-[24px]">
              <img src={Check} className="h-[80px] w-[80px]" />

              <div className="flex flex-col justify-center gap-[8px]">
                <div className="flex items-center gap-[8px]">
                  <span className="text-[20px] font-semibold leading-[28px] text-[#7962ED]">
                    {checkListSection.id}
                  </span>

                  <span className="text-[20px] font-semibold leading-[28px] text-[#10131A]">
                    {checkListSection.title}
                  </span>
                </div>

                <span className="text-[16px] font-medium leading-[24px] text-[#747883]">
                  {checkListSection.description}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              {checkListSection.items.map((item) => (
                <div
                  key={item.id}
                  className="flex h-[72px] items-center gap-[12px] border-t border-[#D2D4DA] py-[24px]"
                >
                  <div
                    className={`flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[4px] border ${
                      item.checked ? 'border-[#7962ED] bg-[#7962ED]' : 'border-[#D2D4DA] bg-white'
                    }`}
                  >
                    {/* 체크됐을 때 체크 아이콘 넣기 */}
                    {/* {item.checked && <img src={CheckIcon} className="h-[12px] w-[12px]" />} */}
                  </div>

                  <span className="text-[16px] font-medium leading-[24px] text-[#10131A]">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
