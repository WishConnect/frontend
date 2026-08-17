import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type { LoginIdCheckResponseData } from '../../types/login/auth';
import { normalizeLoginId } from '../../utils/loginId';

/* 아이디 중복 확인 API.
 *
 * 백엔드: GET /api/v1/auth/login-id/check?loginId= (2026-08-17 추가, 기찬형)
 * 가입 전에 부르는 화면이라 인증 없이 열려 있다(SecurityConfig permitAll).
 * baseURL에 /api/v1 포함이라 여기선 /auth/login-id/check 만 적는다.
 *
 * 형식이 어긋나면 서버가 400(INVALID_LOGIN_ID_FORMAT)을 주지만,
 * 그 전에 utils/loginId.ts 가 화면에서 먼저 걸러낸다.
 */

// available=true면 사용 가능(미사용 중인 아이디).
// 조회 자체가 성공하면 200이고 중복 여부는 body로 오므로, 중복이어도 catch로 빠지지 않는다.
export async function checkLoginIdAvailable(loginId: string): Promise<boolean> {
  const res = await api.get<ApiResponse<LoginIdCheckResponseData>>('/auth/login-id/check', {
    params: { loginId: normalizeLoginId(loginId) },
  });
  return res.data.data.available;
}
