interface DdayStatusProps {
  days: number;
}

type StatusColor = 'red' | 'yellow' | 'gray' | 'purple';

export default function DdayStatus({ days }: DdayStatusProps) {
  const getStatus = (): { color: StatusColor; text: string; label: string } => {
    // 마감
    if (days < 0) {
      return { color: 'gray', text: '마감', label: '마감' };
    }

    // 오늘 마감
    if (days === 0) {
      return { color: 'purple', text: '마감 임박', label: 'D-day' };
    }

    // D-1 ~ D-5
    if (days <= 5) {
      return { color: 'red', text: '마감 임박', label: `D-${days}` };
    }

    // D-6 ~ D-30
    if (days <= 30) {
      return { color: 'yellow', text: `D-${days}`, label: `D-${days}` };
    }

    // D-31 이상
    return { color: 'gray', text: `D-${days}`, label: `D-${days}` };
  };

  const { color, text, label } = getStatus();

  const badgeStyles: Record<StatusColor, string> = {
    red: 'bg-[#FA5862] text-white',
    yellow: 'bg-[#FACC15] text-white',
    gray: 'bg-[#D2D4DA] text-white',
    purple: 'bg-[#7962ED] text-white',
  };

  const textStyles: Record<StatusColor, string> = {
    red: 'text-[#FA5862]',
    yellow: 'text-[#FACC15]',
    gray: 'text-[#9DA1AC]',
    purple: 'text-[#7962ED]',
  };

  return (
    <div className="inline-flex items-center gap-[8px]">
      <div
        className={`w-[55px] h-[32px] flex items-center justify-center rounded-[8px] text-[14px] font-[700] ${badgeStyles[color]}`}
      >
        {label}
      </div>
      <span className={`text-[16px] font-[600] ${textStyles[color]}`}>{text}</span>
    </div>
  );
}
