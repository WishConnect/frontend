import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type { LoginRequest, LoginResponseData } from '../../types/login/auth';

// 기본 로그인 (LOCAL). baseURL에 /api/v1까지 포함돼 있어 여기선 /auth/login만 작성.
// 성공 시 data(accessToken/refreshToken/user)를 반환, 실패 시 axios가 throw.
// ⚠️ 2026-08-18부터 이메일이 아니라 아이디(loginId)로 로그인한다.
//    실패 코드: 401 LOGIN_FAILED(없는 아이디·비밀번호 불일치를 구분하지 않는다),
//              400 INVALID_LOGIN_ID_FORMAT(아이디 형식이 규칙에 안 맞을 때 — 이메일을 그대로 넣은 경우 등).
export async function login(body: LoginRequest): Promise<LoginResponseData> {
  const res = await api.post<ApiResponse<LoginResponseData>>('/auth/login', body);
  return res.data.data;
}

// 서버 로그아웃. 서버(Redis)에 저장된 refreshToken을 폐기한다.
// body 없이 accessToken만 필요(요청 인터셉터가 Bearer 자동 첨부, userId는 서버가 토큰에서 추출).
export async function logout(): Promise<void> {
  await api.post<ApiResponse<null>>('/auth/logout');
}
