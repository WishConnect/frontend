import tipKeywordIcon from '../../assets/search/tip-keyword.svg';
import filterIcon from '../../assets/search/filter-icon.svg';

// 위시커넥트 추천 검색 Tip 배너 — Figma node 1200:1760
export default function SearchTipBanner() {
  return (
    <div className="flex flex-col gap-8 rounded-[16px] bg-[#F9FAFC] px-[46px] py-[42px]">
      <div className="flex items-center gap-3">
        {/* 반짝임 아이콘 자리 — SF 심볼이라 에셋 다운로드 불가, 디자인팀 확정되면 교체 */}
        <span className="h-6 w-6 shrink-0" />
        <h3 className="text-xl font-bold leading-7 tracking-[-0.005em] text-[#0A0C11]">
          <span className="text-[#7962ED]">위시커넥트</span>가 추천하는 검색 Tip
        </h3>
      </div>
      <div className="flex flex-wrap items-center gap-[72px]">
        <div className="flex items-center gap-5">
          <img src={tipKeywordIcon} alt="" className="h-11 w-10 shrink-0" />
          <p className="text-base font-medium leading-6 text-[#555964]">
            키워드만으로도
            <br />
            다양한 장학금을 찾아보세요.
          </p>
        </div>
        <span className="h-10 w-px bg-[#D2D4DA]" />
        <div className="flex items-center gap-5">
          {/* 돋보기+플러스 아이콘 자리 — SF 심볼이라 에셋 다운로드 불가, 디자인팀 확정되면 교체 */}
          <span className="h-11 w-11 shrink-0" />
          <p className="text-base font-medium leading-6 text-[#555964]">
            기관명 + 장학금명으로
            <br />
            더 정확한 결과를 얻을 수 있어요.
          </p>
        </div>
        <span className="h-10 w-px bg-[#D2D4DA]" />
        <div className="flex items-center gap-5">
          <img src={filterIcon} alt="" className="h-7 w-10 shrink-0" />
          <p className="text-base font-medium leading-6 text-[#555964]">
            지원 자격, 기간, 금액 등으로
            <br />
            필터링해보세요.
          </p>
        </div>
      </div>
    </div>
  );
}
