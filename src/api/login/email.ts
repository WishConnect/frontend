import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type {
  EmailCheckResponseData,
  EmailVerifyResponseData,
  VerificationCodeResponseData,
} from '../../types/login/auth';

// 회원가입용 이메일 인증 API 3종. baseURL에 /api/v1이 포함돼 있어 여기선 /auth/email부터 작성.
// 실패 시 axios가 throw하므로 호출부에서 try/catch로 서버 message를 꺼내 쓴다.

// 1) 이메일 중복 확인. available=false면 이미 가입된 이메일(LOCAL 기준).
//    조회 성공이면 200이고 중복 여부는 body의 available로 오므로, 중복이어도 catch로 안 빠진다.
export async function checkEmailAvailable(email: string): Promise<boolean> {
  const res = await api.get<ApiResponse<EmailCheckResponseData>>('/auth/email/check', {
    params: { email },
  });
  return res.data.data.available;
}

// 2) 인증코드(6자리) 메일 발송. 반환값은 코드 유효시간(초).
//    실패 코드: 429 TOO_MANY_REQUESTS(재발송 쿨다운 60초) / 500 EMAIL_SEND_FAILED.
export async function sendVerificationCode(email: string): Promise<number> {
  const res = await api.post<ApiResponse<VerificationCodeResponseData>>(
    '/auth/email/verification-code',
    { email },
  );
  return res.data.data.expiresIn;
}

// 3) 인증코드 확인. 성공하면 서버가 해당 이메일을 30분간 "인증됨"으로 기록하고,
//    그 상태여야만 회원가입(POST /auth/signup)이 통과한다.
//    실패 코드: 400 INVALID_VERIFICATION_CODE(불일치) / 400 VERIFICATION_CODE_EXPIRED(만료·미발송).
export async function verifyEmailCode(email: string, code: string): Promise<boolean> {
  const res = await api.post<ApiResponse<EmailVerifyResponseData>>('/auth/email/verify', {
    email,
    code,
  });
  return res.data.data.verified;
}
