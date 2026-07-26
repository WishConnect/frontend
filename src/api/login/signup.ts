import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type { SignupRequest, SignupResponseData } from '../../types/login/auth';

// 기본 회원가입 (이메일/비밀번호). baseURL에 /api/v1 포함이라 여기선 /auth/signup만.
// 성공(201) 시 data(userId/accessToken/refreshToken) 반환, 실패 시 axios가 throw.
// 실패 코드: 409 DUPLICATE_EMAIL / 400 INVALID_PASSWORD_FORMAT / 400 INVALID_INPUT.
// ⚠️ gender·agreements 필수(백엔드 코드 기준). 누락 시 400 INVALID_INPUT — 타입 참고.
export async function signup(body: SignupRequest): Promise<SignupResponseData> {
  const res = await api.post<ApiResponse<SignupResponseData>>('/auth/signup', body);
  return res.data.data;
}
