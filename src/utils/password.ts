// 비밀번호 정책 검사. 백엔드 PasswordValidator.java와 같은 규칙으로 맞춰,
// 서버까지 갔다가 400 INVALID_PASSWORD_FORMAT을 받기 전에 화면에서 먼저 걸러낸다.
//   - 8~20자
//   - 영문 대문자/소문자/숫자/특수문자 중 3종류 이상
//   - 공백 불가
//   - 이메일과 완전히 같은 문자열 불가

const MIN_LENGTH = 8;
const MAX_LENGTH = 20;
const MIN_CHARACTER_TYPES = 3;

function countCharacterTypes(password: string): number {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  // 위 3종에 속하지 않는 나머지 문자는 전부 특수문자로 본다(백엔드와 동일한 판정).
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
}

// 통과하면 null, 실패하면 사용자에게 보여줄 사유를 반환한다.
export function getPasswordError(password: string, email: string): string | null {
  if (password.length < MIN_LENGTH || password.length > MAX_LENGTH) {
    return '비밀번호는 8자 이상 20자 이하로 입력해 주세요.';
  }
  if (/\s/.test(password)) {
    return '비밀번호에 공백은 사용할 수 없습니다.';
  }
  if (password === email) {
    return '비밀번호를 이메일과 다르게 설정해 주세요.';
  }
  if (countCharacterTypes(password) < MIN_CHARACTER_TYPES) {
    return '영문 대문자·소문자·숫자·특수문자 중 3종류 이상을 조합해 주세요.';
  }
  return null;
}
