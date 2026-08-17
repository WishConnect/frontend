import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type { FindLoginIdResponseData } from '../../types/login/auth';

/* 아이디 찾기 API — 인증을 마친 이메일로 가입된 계정의 로그인 아이디를 돌려받는다.
 *
 * ⚠️ 2026-08-17 현재 서버에 이 엔드포인트가 없다(기찬형께 요청 예정). 지금 호출하면 404다.
 *    서버 스펙이 확정되면 **이 파일과 타입만** 고치면 되고 화면 코드는 안 건드려도 된다.
 *
 * 제안 스펙: POST /api/v1/auth/login-id/find  req { email }  res { loginId }
 *   - code를 같이 보내지 않는 이유: 회원가입이 이미 같은 방식이다. `/auth/email/verify`가 성공하면
 *     서버가 "이 이메일은 인증됨" 상태를 30분간 들고 있고(AuthService.signup 첫 줄의 isVerified 검사),
 *     아이디 찾기도 그 상태를 확인하면 된다. 코드를 다시 받으면 서버가 코드를 지우는 시점 문제로
 *     비밀번호 재설정 쪽처럼 꼬인다.
 *   - 마스킹하지 않는 이유: 이메일 인증을 통과한 본인에게만 보여주는 값이고,
 *     가려서 주면 로그인에 쓸 수가 없어 기능 자체가 무의미해진다.
 *   - 인증 안 된 이메일이면 서버가 400(EMAIL_NOT_VERIFIED)을 주는 게 맞다.
 */
export async function findLoginId(email: string): Promise<string> {
  const res = await api.post<ApiResponse<FindLoginIdResponseData>>('/auth/login-id/find', {
    email: email.trim(),
  });
  return res.data.data.loginId;
}
