import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type {
  FindLoginIdResponseData,
  VerificationCodeResponseData,
} from '../../types/login/auth';

/* 아이디 찾기 API (2026-08-18 백엔드 신설, api-server ba7fcb8).
 *
 * 이메일과 이름이 모두 일치하는 LOCAL 계정에만 인증코드를 보내고, 그 코드를 맞힌 사람에게만
 * 아이디를 알려준다. 회원가입용 이메일 인증(/auth/email/*)과는 코드 저장소가 달라서
 * 섞어 쓰면 인증에 실패한다.
 *
 * 마스킹은 하지 않는다 — 코드 확인을 통과한 본인에게만 주는 값이고, 가려서 주면 로그인에
 * 쓸 수가 없어 기능 자체가 무의미해진다.
 */

// 1) 인증코드 메일 발송. 반환값은 코드 유효시간(초, 서버 기본 300).
//    ⚠️ 계정 열거 방지 때문에 일치하는 계정이 없어도 성공 응답이 온다(메일만 안 감).
//       "메일을 보냈다"가 아니라 "가입돼 있다면 보냈다"로 안내해야 한다.
//    실패 코드: 429 TOO_MANY_REQUESTS(쿨다운 60초, 이메일+이름 조합 기준).
export async function requestLoginIdCode(email: string, name: string): Promise<number> {
  const res = await api.post<ApiResponse<VerificationCodeResponseData>>(
    '/auth/login-id/find-request',
    { email: email.trim(), name: name.trim() },
  );
  return res.data.data.expiresIn;
}

// 2) 코드 확인 + 아이디 조회. 코드는 1회용이라 성공하면 서버에서 지워진다.
//    실패 코드: 400 ACCOUNT_RECOVERY_VERIFICATION_FAILED — 코드가 틀렸을 때와 계정이 아예 없을 때가
//    같은 응답이다(어느 쪽인지 구분해서 알려주면 계정 존재 여부가 새기 때문).
export async function findLoginId(email: string, name: string, code: string): Promise<string> {
  const res = await api.post<ApiResponse<FindLoginIdResponseData>>('/auth/login-id/find', {
    email: email.trim(),
    name: name.trim(),
    code,
  });
  return res.data.data.loginId;
}
