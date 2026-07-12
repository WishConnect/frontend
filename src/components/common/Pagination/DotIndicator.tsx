interface DotIndicatorProps {
  total: number;
  current: number; // 1부터 시작하는 현재 위치
  onDotClick?: (index: number) => void;
}

// 점(dot) 인디케이터 — 배너/캐러셀 슬라이드 위치 표시에 사용
export default function DotIndicator({ total, current, onDotClick }: DotIndicatorProps) {
  return (
    <div className="flex items-center gap-[8px]">
      {Array.from({ length: total }, (_, i) => i + 1).map((index) => (
        <button
          type="button"
          key={index}
          onClick={() => onDotClick?.(index)}
          aria-label={`${index}번째 슬라이드로 이동`}
          className={`size-[8px] rounded-full ${
            index === current ? 'bg-[#7962ED]' : 'bg-[#E6E7EB]'
          }`}
        />
      ))}
    </div>
  );
}
