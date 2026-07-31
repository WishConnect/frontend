import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type {
  PasswordResetRequest,
  PasswordResetResponseData,
  VerificationCodeResponseData,
} from '../../types/login/auth';

// 비밀번호 재설정 API. LOCAL(기본 로그인) 계정만 대상이며, 소셜 가입자는 대상이 아니다.

// 1) 재설정 코드 메일 발송. 반환값은 코드 유효시간(초, 기본 300).
//    ⚠️ 계정 열거 방지 때문에 미가입/소셜 계정이어도 성공 응답이 온다.
//       "메일을 보냈다"가 아니라 "가입돼 있다면 보냈다"로 안내해야 한다.
//    실패 코드: 429 TOO_MANY_REQUESTS(쿨다운 60초).
export async function requestPasswordReset(email: string): Promise<number> {
  const res = await api.post<ApiResponse<VerificationCodeResponseData>>(
    '/auth/password/reset-request',
    { email },
  );
  return res.data.data.expiresIn;
}

// 2) 새 비밀번호로 변경. 위에서 받은 코드가 있어야 하며 코드는 1회용(성공 시 서버에서 삭제).
//    실패 코드: 400 VERIFICATION_CODE_EXPIRED / 400 INVALID_VERIFICATION_CODE /
//              400 INVALID_PASSWORD_FORMAT(8~20자, 영·숫·특 3종 이상 등 정책 위반).
export async function resetPassword(body: PasswordResetRequest): Promise<boolean> {
  const res = await api.post<ApiResponse<PasswordResetResponseData>>('/auth/password/reset', body);
  return res.data.data.reset;
}
