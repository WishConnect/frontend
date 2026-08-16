import { useRef } from 'react';
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';

// 6자리 인증번호 입력. Figma 2462:4748(빈 상태) / 2462:4870(입력된 상태)
// 칸 58x64, 간격 16, radius 8.
//   빈 칸   흰 배경 + 1px 테두리(#D2D4DA)
//   채운 칸 배경 #F4F4FE, 테두리 없음, 숫자 24px/600 #7962ED
const LENGTH = 6;

interface CodeInputProps {
  value: string; // 항상 0~6자리 숫자 문자열
  onChange: (next: string) => void;
  // 6자리가 다 찼을 때 호출(엔터 없이 바로 다음 단계로 넘기고 싶을 때 사용).
  // ⚠️ 완성된 코드를 반드시 인자로 넘긴다. onChange 직후라 부모의 state는 아직 5자리여서,
  //    부모가 자기 state를 읽으면 "6자리를 모두 입력해 주세요"가 잘못 뜬다.
  onComplete?: (code: string) => void;
}

export default function CodeInput({ value, onChange, onComplete }: CodeInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // value를 칸별 배열로 펼친다(부족한 뒤쪽은 빈 문자열).
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '');

  // i번째 칸에 문자를 넣고 전체 문자열을 다시 만든다.
  const writeAt = (index: number, char: string) => {
    const next = digits.map((d, i) => (i === index ? char : d)).join('').slice(0, LENGTH);
    onChange(next);
    return next;
  };

  const handleChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    // 숫자만 남긴다. IME나 붙여넣기로 여러 글자가 한 번에 들어올 수 있어 마지막 한 글자만 취한다.
    const typed = e.target.value.replace(/\D/g, '');
    if (!typed) {
      writeAt(index, '');
      return;
    }

    const char = typed[typed.length - 1];
    const next = writeAt(index, char);

    // 마지막 칸이 아니면 자동으로 다음 칸으로 이동
    if (index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (next.length === LENGTH) {
      onComplete?.(next);
    }
  };

  const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    // 빈 칸에서 백스페이스를 누르면 이전 칸으로 돌아가며 지운다.
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      writeAt(index - 1, '');
      inputRefs.current[index - 1]?.focus();
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 메일에서 복사한 6자리를 첫 칸에 붙여넣으면 한 번에 채워지도록 한다.
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!pasted) return;

    onChange(pasted);
    const focusIndex = Math.min(pasted.length, LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
    if (pasted.length === LENGTH) onComplete?.(pasted);
  };

  return (
    <div className="flex gap-[16px]">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          onChange={handleChange(index)}
          onKeyDown={handleKeyDown(index)}
          onPaste={handlePaste}
          aria-label={`인증번호 ${index + 1}번째 자리`}
          className={`
            h-[64px] w-[58px] rounded-[8px] text-center text-[24px] font-semibold
            leading-[32px] outline-none
            ${
              digit
                ? 'bg-[#F4F4FE] text-[#7962ED]'
                : 'border border-[#D2D4DA] bg-white text-[#7962ED] focus:border-[#7962ED]'
            }
          `}
        />
      ))}
    </div>
  );
}
