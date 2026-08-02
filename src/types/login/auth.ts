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

// 소셜 로그인 요청 body (카카오/구글 공통). 프론트가 받은 인가코드를 서버로 전달.
export interface SocialLoginRequest {
  code: string;
}

// 소셜 로그인 응답 안의 user 객체 (기본 User + loginType)
export interface SocialUser {
  userId: string; // uuid
  name: string;
  loginType: 'KAKAO' | 'GOOGLE';
  onboardingCompleted: boolean;
}

// 소셜 로그인 성공 시 data 필드. isNewUser=true면 신규 자동가입 → 온보딩으로 분기.
export interface SocialLoginResponseData {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: SocialUser;
}
