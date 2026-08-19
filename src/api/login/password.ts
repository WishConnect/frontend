import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type {
  PasswordResetRequest,
  PasswordResetResponseData,
  PasswordResetVerifyResponseData,
  VerificationCodeResponseData,
} from '../../types/login/auth';

// 비밀번호 재설정 API. LOCAL(기본 로그인) 계정만 대상이며, 소셜 가입자는 대상이 아니다.
// ⚠️ 2026-08-18 백엔드가 3단계로 바꿨다(api-server ba7fcb8). 계정을 아이디+이메일 조합으로
//    특정하고, 코드 검증과 비밀번호 변경이 분리됐다.

// 1) 재설정 코드 메일 발송. 반환값은 코드 유효시간(초, 기본 300).
//    ⚠️ 계정 열거 방지 때문에 미가입/소셜 계정이어도 성공 응답이 온다.
//       "메일을 보냈다"가 아니라 "가입돼 있다면 보냈다"로 안내해야 한다.
//    실패 코드: 429 TOO_MANY_REQUESTS(쿨다운 60초, 아이디+이메일 조합 기준),
//              400 INVALID_LOGIN_ID_FORMAT(아이디가 a-z/0-9/_ 4~20자 규칙을 벗어남).
export async function requestPasswordReset(loginId: string, email: string): Promise<number> {
  const res = await api.post<ApiResponse<VerificationCodeResponseData>>(
    '/auth/password/reset-request',
    { loginId: loginId.trim(), email: email.trim() },
  );
  return res.data.data.expiresIn;
}

// 2) 코드 확인 → 비밀번호 변경에만 쓸 수 있는 1회용 resetToken 발급(유효시간 300초).
//    코드는 여기서 소모되므로, 이 단계를 통과한 뒤 3)에서 다시 코드를 보낼 필요가 없다.
//    실패 코드: 400 ACCOUNT_RECOVERY_VERIFICATION_FAILED(코드 불일치·만료, 계정 불일치도 동일 응답).
export async function verifyPasswordResetCode(
  loginId: string,
  email: string,
  code: string,
): Promise<PasswordResetVerifyResponseData> {
  const res = await api.post<ApiResponse<PasswordResetVerifyResponseData>>(
    '/auth/password/verify',
    { loginId: loginId.trim(), email: email.trim(), code },
  );
  return res.data.data;
}

// 3) 새 비밀번호로 변경. 성공하면 서버가 기존 refresh token을 지워 다른 세션을 끊는다.
//    실패 코드: 400 PASSWORD_RESET_TOKEN_INVALID(토큰 만료·재사용),
//              400 INVALID_PASSWORD_FORMAT(8~20자, 영·숫·특 3종 이상 등 정책 위반).
export async function resetPassword(body: PasswordResetRequest): Promise<boolean> {
  const res = await api.post<ApiResponse<PasswordResetResponseData>>('/auth/password/reset', body);
  return res.data.data.reset;
}
