// 로그인(인증) 관련 API 타입. 백엔드 명세: POST /api/v1/auth/login

// 요청 body
// ⚠️ 2026-08-18 백엔드가 기본 로그인을 이메일 → 아이디(login_id) 기준으로 바꿨다
//    (api-server ba7fcb8). email로 보내면 @NotBlank 위반이라 400.
//    서버가 trim + 소문자로 낮춰 조회하므로 대소문자는 신경 쓰지 않아도 된다.
export interface LoginRequest {
  loginId: string;
  password: string;
}

// 로그인 응답 안의 user 객체 (전역 userStore에 저장하는 유저 정보)
export interface User {
  userId: string; // uuid
  name: string;
  onboardingCompleted: boolean;
}

// 로그인 성공 시 data 필드
export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// 회원가입 요청 body (POST /api/v1/auth/signup)
// ⚠️ Swagger 운영 명세엔 4필드로 나오지만, 배포 백엔드 실제 코드(SignupRequest.java)는
//    gender(@NotNull)·agreements(@NotEmpty)가 필수라 4개만 보내면 400. 코드 기준으로 맞춤.
export type Gender = 'FEMALE' | 'MALE' | 'NONE'; // 여성/남성/선택안함
export type Nationality = 'DOMESTIC' | 'FOREIGN'; // 내국인/외국인
export type AgreementType = 'TERMS' | 'PRIVACY' | 'THIRD_PARTY' | 'AGE_14';

// 약관 동의 항목. JSON 필드명은 isAgreed(백엔드 @JsonProperty).
export interface AgreementItem {
  type: AgreementType;
  isAgreed: boolean;
}

export interface SignupRequest {
  // 로그인 아이디. 필수(@NotBlank). 규칙은 utils/loginId.ts 참고 (a-z/0-9/_ 4~20자).
  // 서버가 소문자로 낮춰 저장하며, 중복 시 409 DUPLICATE_LOGIN_ID.
  loginId: string;
  email: string; // 필수
  password: string; // 필수. 8~20자, 영/숫/특 3종 이상, 공백·이메일동일 불가
  name: string; // 필수
  phone: string; // 필수. 예: "010-1234-5678"
  gender: Gender; // 필수(@NotNull)
  agreements: AgreementItem[]; // 필수(@NotEmpty, 최소 1개)
  // 생년월일 'yyyy-MM-dd'. 2026-08-17 백엔드가 birthYear(연도)에서 birthDate(LocalDate)로 교체했다.
  // 예전 이름(birthYear)으로 보내면 서버가 모르는 필드라 조용히 버려지고 생년월일이 NULL로 저장된다.
  birthDate?: string;
  nationality?: Nationality; // 선택
  region?: string; // 선택. 정식명칭("서울특별시")으로 보내면 서버가 "서울"로 바꿔 조회
}

// 회원가입 성공 시 data 필드 (201). 로그인과 달리 user 객체가 없고 userId만 옴.
export interface SignupResponseData {
  userId: string; // uuid
  accessToken: string;
  refreshToken: string;
}

// 토큰 갱신 성공 시 data 필드 (POST /api/v1/auth/refresh)
export interface TokenRefreshResponseData {
  accessToken: string;
  refreshToken: string;
}

/* ------------------------------------------------------------------
 * 이메일 인증 (회원가입 선행 단계)
 * 백엔드 AuthService.signup() 첫 줄이 isVerified(email) 검사라, 아래 3단계를
 * 통과하지 않으면 회원가입은 400 EMAIL_NOT_VERIFIED로 막힌다.
 *   1) GET  /auth/email/check?email=       중복 확인
 *   2) POST /auth/email/verification-code  6자리 코드 메일 발송
 *   3) POST /auth/email/verify             코드 확인(서버가 "인증됨" 상태 30분 보관)
 * ------------------------------------------------------------------ */

// 이메일 중복 확인 응답. available=true면 가입 가능(LOCAL 기준 미가입).
export interface EmailCheckResponseData {
  available: boolean;
}

// 아이디 중복 확인 응답(GET /auth/login-id/check). 이메일 쪽과 같은 형태.
export interface LoginIdCheckResponseData {
  available: boolean;
}

/* ------------------------------------------------------------------
 * 아이디 찾기 (LOCAL 계정 전용, 2026-08-18 백엔드 신설)
 *   1) POST /auth/login-id/find-request  { email, name }        코드 메일 발송
 *   2) POST /auth/login-id/find          { email, name, code }  코드 확인 + 아이디 반환
 * 회원가입용 이메일 인증(/auth/email/*)과는 별개 흐름이다. 코드도 서로 다른 Redis 키에 저장돼
 * 섞어 쓰면 "코드가 올바르지 않습니다"가 난다.
 * ------------------------------------------------------------------ */

// 코드 발송 요청 body. 이름은 서버가 실제로 대조한다(email + name + LOCAL + 미탈퇴).
// 계정 열거 방지로, 일치하는 계정이 없어도 응답은 성공이고 메일만 안 간다.
export interface LoginIdFindCodeRequest {
  email: string;
  name: string;
}

// 코드 확인 + 아이디 조회 요청 body. code는 6자리 숫자 문자열.
export interface LoginIdFindRequest extends LoginIdFindCodeRequest {
  code: string;
}

// 아이디 찾기 응답(POST /auth/login-id/find). 마스킹 없이 전체 아이디가 온다.
export interface FindLoginIdResponseData {
  // 서버가 user.getLoginId()를 그대로 내려주는데, login_id는 2026-08-16 마이그레이션에서
  // nullable로 추가되고 백필이 없었다. 그 전에 가입한 계정은 값이 NULL이라 null이 올 수 있다.
  loginId: string | null;
}

// 인증코드 발송 요청 body
export interface SendVerificationCodeRequest {
  email: string;
}

// 인증코드 발송 응답. expiresIn은 코드 유효시간(초, 서버 기본 300=5분).
// 재발송은 60초 쿨다운이 있어 그 전에 다시 부르면 429 TOO_MANY_REQUESTS.
export interface VerificationCodeResponseData {
  sent: boolean;
  expiresIn: number;
}

// 인증코드 확인 요청 body. code는 6자리 숫자 문자열.
export interface EmailVerifyRequest {
  email: string;
  code: string;
}

// 인증코드 확인 응답
export interface EmailVerifyResponseData {
  verified: boolean;
}

/* ------------------------------------------------------------------
 * 비밀번호 재설정 (LOCAL 계정 전용)
 * ⚠️ 2026-08-18 백엔드가 3단계로 바꿨다(api-server ba7fcb8). 계정을 아이디+이메일 조합으로
 *    특정하고, 코드 검증과 비밀번호 변경이 분리됐다. 예전 2단계 스펙으로 보내면 전부 400.
 *   1) POST /auth/password/reset-request  { loginId, email }        코드 메일 발송
 *   2) POST /auth/password/verify         { loginId, email, code }  코드 확인 → resetToken 발급
 *   3) POST /auth/password/reset          { resetToken, newPassword }
 * ------------------------------------------------------------------ */

// 재설정 코드 발송 요청 body.
// 계정 열거(어떤 계정이 가입돼 있는지 떠보기) 방지를 위해 서버는 일치하는 계정이 없어도
// 똑같이 성공 응답을 준다. 즉 응답만으로 가입 여부를 알 수 없다(메일만 안 감).
export interface PasswordResetCodeRequest {
  loginId: string;
  email: string;
}

// 코드 확인 요청 body. code는 6자리 숫자 문자열.
export interface PasswordResetVerifyRequest extends PasswordResetCodeRequest {
  code: string;
}

// 코드 확인 응답. resetToken은 비밀번호 변경에만 쓰는 1회용 토큰이고 expiresIn(초) 뒤 만료된다.
export interface PasswordResetVerifyResponseData {
  resetToken: string;
  expiresIn: number;
}

// 새 비밀번호로 변경 요청 body. 계정 식별은 resetToken이 대신하므로 이메일·코드를 다시 보내지 않는다.
export interface PasswordResetRequest {
  resetToken: string;
  newPassword: string; // 비밀번호 정책은 회원가입과 동일
}

// 비밀번호 변경 응답
export interface PasswordResetResponseData {
  reset: boolean;
}

// 소셜 로그인 요청 body의 공통 부분: 제공자에게 받은 인가코드.
interface SocialLoginBase {
  code: string;
}

// 소셜 로그인 요청 body (카카오/구글 공통). 프론트가 받은 인가코드를 서버로 전달.
// redirectUri: 인가코드를 받을 때 사용한 콜백 주소. OAuth 규약상 서버가 토큰 교환 시 보내는 값이
//   인가 시점의 값과 완전히 같아야 하는데, 서버 기본값은 운영 도메인이라 로컬에선 어긋난다.
//   그래서 프론트가 자기가 쓴 값을 함께 보낸다(서버가 허용목록과 대조 후 사용, 아니면 400).
//   백엔드는 선택 필드로 두었지만(미전송 시 서버 기본값), 로컬/배포 모두 항상 보내는 게 맞아 필수로 둔다.
export interface SocialLoginRequest extends SocialLoginBase {
  redirectUri: string;
}

// 소셜 로그인 응답 안의 user 객체 (기본 User + loginType)
// 백엔드 LoginType enum 기준. 프론트는 카카오/구글만 쓰지만(네이버는 2026-08-19 제외),
// 서버 enum 에는 NAVER 가 남아 있어 응답 타입에서는 그대로 받는다.
export interface SocialUser {
  userId: string; // uuid
  name: string;
  loginType: 'KAKAO' | 'GOOGLE' | 'NAVER';
  onboardingCompleted: boolean;
}

// 소셜 로그인 성공 시 data 필드. isNewUser=true면 신규 자동가입 → 온보딩으로 분기.
export interface SocialLoginResponseData {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: SocialUser;
}
