// GET /users/me 응답 data — 마이페이지 첫 화면용 사용자 요약 정보
export interface MyPageSummary {
  userId: string;
  name: string;
  email: string;
  birthYear: string;
  region: string;
  profileCompletionRate: number;
  scrappedCount: number;
  applicationCount: number;
  completedCount: number;
  // 온보딩을 아직 완료하지 않은 유저는 이 값이 null로 옴
  recommendationCriteria: {
    grade: string;
    gpa: number;
    incomeLevel: string;
    interests: string[];
  } | null;
}

// PATCH /users/me/password 요청 body
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

// PATCH /users/me/password 응답 data
export interface UpdatePasswordResponse {
  updated: boolean;
}

// PATCH /users/me/email 요청 body — 인증이 완료된 이메일 주소로 변경
export interface UpdateEmailRequest {
  email: string;
}

// PATCH /users/me/email 응답 data
export interface UpdateEmailResponse {
  updated: boolean;
}

// POST /users/me/email/check 요청 body — 이메일 중복 확인
export interface CheckEmailRequest {
  email: string;
}

// POST /users/me/email/check 응답 data
export interface CheckEmailResponse {
  available: boolean;
}

// POST /users/me/email/verification 요청 body — 인증코드 발송
export interface SendEmailVerificationRequest {
  email: string;
}

// POST /users/me/email/verification 응답 data
export interface SendEmailVerificationResponse {
  updated: boolean;
}

// POST /users/me/email/verify 요청 body — 인증코드 확인
export interface VerifyEmailCodeRequest {
  email: string;
  code: string;
}

// POST /users/me/email/verify 응답 data
export interface VerifyEmailCodeResponse {
  updated: boolean;
}
