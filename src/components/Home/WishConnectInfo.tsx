import WishLogo from '../../assets/icons/WishLogo.svg';
import WishConnect from '../../assets/icons/WishConnect.svg';
import Choice from '../../assets/icons/choice.svg';

export default function WishConnectInfo() {
  return (
    <article className="flex h-[256px] w-[416px] overflow-hidden rounded-[16px] border border-[#D2D4DA] bg-white">
      {/* 왼쪽 텍스트 영역 */}
      <div className="flex w-[212px] shrink-0 flex-col pt-[30px] pl-[36px]">
        <img src={WishLogo} alt="WISHCONNECT" className="h-auto w-[206px]" />

        <p className="whitespace-nowrap mt-[16px] text-[14px] font-medium leading-[20px] text-[#555964]">
          장학금 탐색부터 AI 지원서 작성까지
          <br />
          모든 과정을 한 곳에서.
        </p>

        <div className="mt-[24px] flex flex-col gap-[8px]">
          <div className="flex h-[20px] items-center gap-[6px]">
            <img src={Choice} alt="" className="h-[14px] w-[16px]" />
            <span className="text-[14px] font-medium leading-[20px] text-[#10131A]">
              맞춤 장학금 추천
            </span>
          </div>

          <div className="flex h-[20px] items-center gap-[6px]">
            <img src={Choice} alt="" className="h-[14px] w-[16px]" />
            <span className="text-[14px] font-medium leading-[20px] text-[#10131A]">
              AI 지원서 작성
            </span>
          </div>

          <div className="flex h-[20px] items-center gap-[6px]">
            <img src={Choice} alt="" className="h-[14px] w-[16px]" />
            <span className="text-[14px] font-medium leading-[20px] text-[#10131A]">
              합격 인사이트
            </span>
          </div>
        </div>
      </div>

      {/* 오른쪽 이미지 영역 */}
      <div className="flex flex-1 items-end justify-end">
        <img src={WishConnect} alt="WishConnect" className="h-[166px] w-[247px] object-contain" />
      </div>
    </article>
  );
}
