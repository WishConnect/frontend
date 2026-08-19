// 아이디 정책 검사. utils/password.ts와 같은 역할로, 서버까지 갔다가 400을 받기 전에
// 화면에서 먼저 걸러낸다.
//   - 4~20자
//   - 영문 소문자 + 숫자 + 언더스코어(_)
//
// ⚠️ 백엔드 검증과 반드시 같아야 한다. 프론트만 바꾸면 안내와 실제 동작이 어긋난다
//    (비밀번호가 시안 8~16 vs 백엔드 8~20으로 어긋난 전례가 있음).
//    백엔드 대응 위치: api-server AuthService.LOGIN_ID_PATTERN (2026-08-17 확인)
//    서버 실패 코드는 400 INVALID_LOGIN_ID_FORMAT / 409 DUPLICATE_LOGIN_ID.

// 서버와 동일한 정규식. 이메일과 헷갈리지 않도록 @ 와 점(.)은 서버가 막는다.
export const LOGIN_ID_PATTERN = /^[a-z0-9_]{4,20}$/;

// 서버가 저장·중복검사 전에 trim + 소문자로 낮춘다(Junho 와 junho 를 같은 아이디로 본다).
// 프론트도 같은 값으로 맞춰야 "중복확인은 통과했는데 가입에서 형식 오류" 같은 어긋남이 안 난다.
export function normalizeLoginId(loginId: string): string {
  return loginId.trim().toLowerCase();
}

// 입력창 아래 안내와 오류 문구에 같이 쓴다. 규칙과 문구가 한 파일에 있어야
// 규칙만 고치고 문구는 그대로 두는 실수가 안 난다.
export const LOGIN_ID_RULE_TEXT = '영문 소문자, 숫자, 언더스코어(_)로 4~20자를 입력해 주세요.';

// 통과하면 null, 실패하면 사용자에게 보여줄 사유를 반환한다.
export function getLoginIdError(loginId: string): string | null {
  const normalized = normalizeLoginId(loginId);
  if (!normalized) {
    return '아이디를 입력해 주세요.';
  }
  if (!LOGIN_ID_PATTERN.test(normalized)) {
    return LOGIN_ID_RULE_TEXT;
  }
  return null;
}
