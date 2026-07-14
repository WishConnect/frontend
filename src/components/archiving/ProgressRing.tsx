interface ProgressRingProps {
  percent: number;
}

const SIZE = 32;
const STROKE_WIDTH = 3;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// 자기소개서 진행률 배지: 썸네일 우측 상단에 항상 노출, 채워지는 정도가 progressPercent를 따라가다가 100%면 체크 아이콘으로 전환
export default function ProgressRing({ percent }: ProgressRingProps) {
  const isDone = percent >= 100;
  const offset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-white">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#E6E7EB" strokeWidth={STROKE_WIDTH} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#7962ED"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>

      {isDone && <span className="absolute text-xs font-semibold text-[#7962ED]">✓</span>}
    </div>
  );
}
