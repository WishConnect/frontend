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
