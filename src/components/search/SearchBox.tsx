import { useState } from 'react';
import searchIcon from '../../assets/search-icon.svg';
import filterIcon from '../../assets/search/filter-icon.svg';

interface SearchBoxProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
}

// 장학금 찾아보기 검색창: Figma node 1200:1660(기본) / 1200:1985 + 1200:1919(필터 열림)
// 필터 아이콘 클릭 시 최근 검색어 자리를 필터 패널(지원 기간/지원 금액/지역)로 교체
export default function SearchBox({
  query,
  onQueryChange,
  onSearch,
  isFilterOpen,
  onToggleFilter,
}: SearchBoxProps) {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [region, setRegion] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch();
  };

  const handleReset = () => {
    setDateStart('');
    setDateEnd('');
    setMinAmount('');
    setMaxAmount('');
    setRegion('');
  };

  return (
    <div
      className={`bg-[#F9FAFC] ${
        isFilterOpen
          ? 'rounded-t-[16px] border border-b-0 border-[#E6E7EB] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.05)]'
          : 'rounded-[16px]'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex flex-1 items-center gap-5">
          <img src={searchIcon} alt="검색" className="size-5 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="장학금, 기관명, 키워드로 검색해보세요"
            className="w-full bg-transparent text-base font-medium text-[#9DA1AC] outline-none placeholder:text-[#9DA1AC]"
          />
        </div>
        <button type="button" onClick={onToggleFilter} className="shrink-0">
          <img src={filterIcon} alt="필터" className="h-[16px] w-[22px]" />
        </button>
      </div>

      {isFilterOpen && (
        <div className="flex flex-col gap-6 rounded-b-[16px] border-t border-[#E6E7EB] px-6 py-6 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={filterIcon} alt="" className="h-[16px] w-[22px]" />
              <h3 className="text-xl font-semibold leading-7 text-[#0A0C11]">필터</h3>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-base font-medium text-[#9DA1AC]"
            >
              {/* 초기화 아이콘 자리: SF 심볼이라 에셋 다운로드 불가, 디자인팀 확정되면 교체 */}
              <span className="h-4 w-4" />
              초기화
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-14">
            <div className="flex items-center gap-4 rounded-[8px] border border-[#E6E7EB] bg-white px-4 py-3">
              {/* 달력 아이콘 자리: SF 심볼이라 에셋 다운로드 불가, 디자인팀 확정되면 교체 */}
              <span className="h-5 w-5 shrink-0" />
              <input
                type="text"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                placeholder="시작일 선택"
                className="w-[74px] bg-transparent text-base font-medium text-[#555964] outline-none placeholder:text-[#555964]"
              />
              <span className="h-px w-2 bg-[#555964]" />
              <input
                type="text"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                placeholder="종료일 선택"
                className="w-[74px] bg-transparent text-base font-medium text-[#555964] outline-none placeholder:text-[#555964]"
              />
            </div>

            <div className="flex items-center gap-4 rounded-[8px] border border-[#E6E7EB] bg-white px-4 py-3">
              <span className="text-[15px] font-semibold text-[#9DA1AC]">₩</span>
              <input
                type="text"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="최소 금액"
                className="w-[60px] bg-transparent text-base font-medium text-[#555964] outline-none placeholder:text-[#555964]"
              />
              <span className="h-px w-2 bg-[#555964]" />
              <input
                type="text"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="최대 금액"
                className="w-[60px] bg-transparent text-base font-medium text-[#555964] outline-none placeholder:text-[#555964]"
              />
            </div>

            <div className="flex items-center gap-4 rounded-[8px] border border-[#E6E7EB] bg-white px-4 py-3">
              {/* 지역 핀 아이콘 자리: SF 심볼이라 에셋 다운로드 불가, 디자인팀 확정되면 교체 */}
              <span className="h-5 w-5 shrink-0" />
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="지역 입력"
                className="w-[100px] bg-transparent text-base font-medium text-[#555964] outline-none placeholder:text-[#555964]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
