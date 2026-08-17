// 로그인(인증) 관련 API 타입. 백엔드 명세: POST /api/v1/auth/login

// 요청 body
export interface LoginRequest {
  email: string;
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

// 아이디 찾기 응답(POST /auth/login-id/find). ⚠️ 서버 미구현 — api/login/findLoginId.ts 주석 참고.
export interface FindLoginIdResponseData {
  loginId: string;
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
 *   1) POST /auth/password/reset-request  재설정 코드 메일 발송
 *   2) POST /auth/password/reset          코드 + 새 비밀번호로 변경
 * ------------------------------------------------------------------ */

// 재설정 코드 발송 요청 body.
// 계정 열거(어떤 이메일이 가입돼 있는지 떠보기) 방지를 위해 서버는 미가입/소셜 계정이어도
// 똑같이 성공 응답을 준다. 즉 응답만으로 가입 여부를 알 수 없다.
export interface PasswordResetCodeRequest {
  email: string;
}

// 새 비밀번호로 변경 요청 body
export interface PasswordResetRequest {
  email: string;
  code: string;
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

// 네이버만 인가코드와 함께 state를 요구한다 (백엔드 NaverLoginRequest.java: record(code, state)).
// state는 CSRF 방지용 랜덤값으로, 프론트가 인가 URL 생성 시 만들어 콜백에서 되돌려받은 값을 그대로 전달.
// 네이버는 토큰 교환에 redirect_uri를 쓰지 않아(NaverApiClient) redirectUri를 보내지 않는다.
export interface NaverLoginRequest extends SocialLoginBase {
  state: string;
}

// 소셜 로그인 응답 안의 user 객체 (기본 User + loginType)
// 백엔드 LoginType enum 기준: LOCAL/KAKAO/GOOGLE/NAVER 중 소셜 3종.
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
