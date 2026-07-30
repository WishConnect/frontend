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
  email: string; // 필수
  password: string; // 필수. 8~20자, 영/숫/특 3종 이상, 공백·이메일동일 불가
  name: string; // 필수
  phone: string; // 필수. 예: "010-1234-5678"
  gender: Gender; // 필수(@NotNull)
  agreements: AgreementItem[]; // 필수(@NotEmpty, 최소 1개)
  birthYear?: number; // 선택
  nationality?: Nationality; // 선택
  region?: string; // 선택
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
