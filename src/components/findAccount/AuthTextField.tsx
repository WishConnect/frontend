import type { InputHTMLAttributes } from 'react';

// 계정 찾기 화면 공용 입력창
// Figma 2462:4599 기준: 596x64, radius 8, 테두리 #D2D4DA, 좌측 여백 24px.
// 값이 있으면 #555964, 비어 있으면 placeholder가 #9DA1AC.
// 회원가입에서 쓰는 TextField1은 textarea 기반이라 type="password" 마스킹이 안 돼서 여기선 쓰지 않는다.
interface AuthTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  // 읽기 전용으로 이전 단계 입력값을 보여줄 때 사용(예: 이름 단계에서 이메일 표시)
  readOnlyLook?: boolean;
}

export default function AuthTextField({
  readOnlyLook = false,
  className = '',
  ...props
}: AuthTextFieldProps) {
  return (
    <input
      {...props}
      readOnly={readOnlyLook || props.readOnly}
      className={`
        h-[64px] w-[596px] rounded-[8px] border border-[#D2D4DA] bg-white
        px-[24px] text-[16px] font-medium leading-[24px] text-[#555964]
        outline-none placeholder:text-[#9DA1AC]
        focus:border-[#7962ED]
        ${readOnlyLook ? 'cursor-default focus:border-[#D2D4DA]' : ''}
        ${className}
      `}
    />
  );
}
