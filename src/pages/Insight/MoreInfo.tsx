import { useState } from 'react';

import QnA from '../../assets/icons/QnA.svg';
import Search from '../../assets/icons/Search.svg';
import Check from '../../assets/icons/Check.svg';
import CheckBox from '../../assets/icons/CheckBox.svg';

import { referenceSections, checkListSection } from '../../data/referenceData';
import FaqDropdown from '../../components/FAQ/FaqDropDown';
import Header from '../../components/common/Header/Header';

const faqSection = referenceSections[0];
const guideSection = referenceSections[1];

export default function MoreInfoPage() {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  const handleCheck = (id: number) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-['Pretendard']">
      <Header />

      <div className="mt-[32px] flex w-[1440px] flex-col gap-[48px] px-[109px] pb-[64px]">
        <div className="flex w-[486px] flex-col gap-[4px]">
          <span className="h-[48px] text-[36px] leading-[48px] font-bold text-[#10131A]">
            참고하면 좋아요
          </span>

          <span className="h-[24px] text-[16px] leading-[24px] font-medium text-[#555964]">
            장학금 준비에 도움이 되는 정보를 모았어요.
          </span>
        </div>

        <div className="box-border flex h-[1916px] w-[1222px] flex-col gap-[32px] pb-[64px]">
          <article className="flex w-[1222px] flex-col gap-[36px] rounded-[16px] border border-[#D2D4DA] px-[48px] py-[36px]">
            <div className="flex h-[80px] gap-[24px]">
              <img src={QnA} alt="" className="h-[80px] w-[80px]" />

              <div className="flex flex-col justify-center gap-[8px]">
                <div className="flex items-center gap-[8px]">
                  <span className="text-[20px] leading-[28px] font-semibold text-[#7962ED]">
                    {faqSection.id}
                  </span>

                  <span className="text-[20px] leading-[28px] font-semibold text-[#10131A]">
                    {faqSection.title}
                  </span>
                </div>

                <span className="text-[16px] leading-[24px] font-medium text-[#747883]">
                  {faqSection.description}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              {faqSection.items.map((item) => (
                <FaqDropdown key={item.id} question={item.question} answer={item.answer} />
              ))}
            </div>
          </article>

          <article className="flex w-[1222px] flex-col gap-[36px] rounded-[16px] border border-[#D2D4DA] px-[48px] py-[36px]">
            <div className="flex h-[80px] gap-[24px]">
              <img src={Search} alt="" className="h-[80px] w-[80px]" />

              <div className="flex flex-col justify-center gap-[8px]">
                <div className="flex items-center gap-[8px]">
                  <span className="text-[20px] leading-[28px] font-semibold text-[#7962ED]">
                    {guideSection.id}
                  </span>

                  <span className="text-[20px] leading-[28px] font-semibold text-[#10131A]">
                    {guideSection.title}
                  </span>
                </div>

                <span className="text-[16px] leading-[24px] font-medium text-[#747883]">
                  {guideSection.description}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              {guideSection.items.map((item) => (
                <FaqDropdown key={item.id} question={item.question} answer={item.answer} />
              ))}
            </div>
          </article>

          <article className="flex w-[1222px] flex-col gap-[36px] rounded-[16px] border border-[#D2D4DA] px-[48px] py-[36px]">
            <div className="flex h-[80px] gap-[24px]">
              <img src={Check} alt="" className="h-[80px] w-[80px]" />

              <div className="flex flex-col justify-center gap-[8px]">
                <div className="flex items-center gap-[8px]">
                  <span className="text-[20px] leading-[28px] font-semibold text-[#7962ED]">
                    {checkListSection.id}
                  </span>

                  <span className="text-[20px] leading-[28px] font-semibold text-[#10131A]">
                    {checkListSection.title}
                  </span>
                </div>

                <span className="text-[16px] leading-[24px] font-medium text-[#747883]">
                  {checkListSection.description}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              {checkListSection.items.map((item) => {
                const isChecked = checkedItems.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="flex h-[72px] items-center gap-[12px] border-t border-[#D2D4DA] py-[24px]"
                  >
                    <button
                      type="button"
                      onClick={() => handleCheck(item.id)}
                      aria-label={isChecked ? `${item.text} 체크 해제` : `${item.text} 체크`}
                      aria-pressed={isChecked}
                      className="flex h-[24px] w-[24px] shrink-0 items-center justify-center"
                    >
                      {isChecked ? (
                        <img src={CheckBox} alt="" className="h-[24px] w-[24px]" />
                      ) : (
                        <span className="h-[24px] w-[24px] rounded-[4px] border border-[#D2D4DA] bg-white" />
                      )}
                    </button>

                    <span className="text-[16px] leading-[24px] font-medium text-[#10131A]">
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
