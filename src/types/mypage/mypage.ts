// GET /users/me 응답 data — 마이페이지 첫 화면용 사용자 요약 정보
export interface MyPageSummary {
  userId: string;
  name: string;
  email: string;
  // 실제 응답 필드명은 birthYear가 아니라 birthDate. 값이 없으면 null.
  birthDate: string | null;
  region: string | null;
  profileCompletionRate: number;
  scrappedCount: number;
  applicationCount: number;
  completedCount: number;
  // 온보딩을 아직 완료하지 않은 유저는 이 값이 null로 옴.
  // 완료한 유저라도, 소득분위를 "모름"으로 저장한 경우 incomeLevel만 null로 올 수 있음
  // (다른 필드도 저장 안 된 값이 있으면 개별적으로 null일 수 있음 — 안전하게 전부 nullable 처리)
  recommendationCriteria: {
    grade: string | null;
    gpa: number | null;
    incomeLevel: string | null;
    interests: string[] | null;
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
