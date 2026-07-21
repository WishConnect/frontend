import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type { LoginRequest, LoginResponseData } from '../../types/login/auth';

// 기본 로그인 (LOCAL). baseURL에 /api/v1까지 포함돼 있어 여기선 /auth/login만 작성.
// 성공 시 data(accessToken/refreshToken/user)를 반환, 실패(401/404) 시 axios가 throw.
export async function login(body: LoginRequest): Promise<LoginResponseData> {
  const res = await api.post<ApiResponse<LoginResponseData>>('/auth/login', body);
  return res.data.data;
}
