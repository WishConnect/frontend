import { Fragment } from 'react';
import { mockPopularSearches } from '../../data/mockPopularSearches';

interface PopularSearchesProps {
  onSelect: (term: string) => void;
}

// 인기 검색어 TOP5: Figma node 1200:1667
export default function PopularSearches({ onSelect }: PopularSearchesProps) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-2xl font-bold leading-8 tracking-[-0.01em] text-[#0A0C11]">인기 검색어</h2>
      <div className="flex flex-wrap items-center gap-[52px]">
        {mockPopularSearches.map((term, index) => (
          <Fragment key={term}>
            <button type="button" onClick={() => onSelect(term)} className="flex items-center gap-5">
              <span className="text-[28px] font-bold leading-10 tracking-[-0.01em] text-[#7962ED]">
                {index + 1}
              </span>
              <span className="text-xl font-medium leading-7 tracking-[-0.005em] text-[#0A0C11]">{term}</span>
            </button>
            {index < mockPopularSearches.length - 1 && <span className="h-[22px] w-px bg-[#9DA1AC]" />}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
