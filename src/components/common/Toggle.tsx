interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  ariaLabel?: string;
}

// 온/오프 스위치: 알림 패널/알림 설정 페이지 공용
export default function Toggle({ checked, onChange, ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={`relative w-[58px] h-[34px] rounded-full shrink-0 transition-colors ${
        checked ? 'bg-[#7962ED]' : 'bg-[#D2D4DA]'
      }`}
    >
      <span
        className={`absolute left-[3px] top-[3px] size-[28px] rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[24px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
