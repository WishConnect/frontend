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
// 명세상 필드는 4개뿐. SignPage의 출생년도/성별/국적/거주지역/인증코드는 이 요청에 안 들어감.
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone: string; // 예: "010-1234-5678"
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
