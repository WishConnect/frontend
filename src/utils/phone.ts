// 연락처 입력 정리·검사. utils/password.ts, utils/loginId.ts와 같은 역할.
//
// ⚠️ 서버는 연락처를 검증하지 않는다(2026-08-17 확인). `SignupRequest.phone`이 `@NotBlank`뿐이고
//    `AuthService`도 받은 문자열을 그대로 저장한다 — 즉 "010 1234 5678"도 "없음"도 그냥 들어간다.
//    그래서 표기를 하나로 맞추는 책임이 지금은 전적으로 화면에 있다.
//    (서버에 정규화가 생기면 이 파일의 규칙과 어긋나지 않는지 확인할 것)

// 저장 표기는 하이픈 포함으로 통일한다: 010-1234-5678
// 숫자만 저장하는 방법도 있지만, 화면에 다시 보여줄 때 매번 포맷해야 하고
// 마이페이지 등 남의 화면은 값을 그대로 뿌리고 있어 하이픈 포함이 안전하다.
export const PHONE_RULE_TEXT = '연락처 형식을 확인해 주세요. (예: 010-1234-5678)';

// 휴대폰 번호. 010 외에 예전 번호(011·016·017·018·019)도 받고, 총 10~11자리를 허용한다.
const PHONE_DIGITS_PATTERN = /^01[016789]\d{7,8}$/;

/**
 * 입력값에서 숫자만 남기고 하이픈을 끼워 넣는다. 하이픈을 직접 치거나 공백이 섞여도,
 * "010-1234-5678"을 통째로 붙여넣어도 같은 결과가 나온다.
 * 11자리를 넘는 입력은 잘라서 애초에 들어가지 않게 한다.
 */
export function formatPhone(value: string): string {
    let digits = value.replace(/\D/g, '');
    // 연락처를 국가번호까지 복사해오는 경우가 있다(+82 10-1234-5678). 국내 표기로 되돌린다.
    if (digits.startsWith('82')) {
        digits = `0${digits.slice(2)}`;
    }
    digits = digits.slice(0, 11);

    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    // 11자리는 3-4-4, 그보다 짧으면 3-3-나머지. 10자리 옛날 번호(011-123-4567)도 이 규칙으로 맞는다.
    if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// 통과하면 null, 실패하면 사용자에게 보여줄 사유를 반환한다.
export function getPhoneError(value: string): string | null {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
        return '연락처를 입력해 주세요.';
    }
    if (!PHONE_DIGITS_PATTERN.test(digits)) {
        return PHONE_RULE_TEXT;
    }
    return null;
}
