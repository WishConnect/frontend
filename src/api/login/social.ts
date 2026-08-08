import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type { SocialLoginRequest, SocialLoginResponseData } from '../../types/login/auth';

// 카카오 소셜 로그인. 프론트가 카카오에서 받은 인가코드(code)를 서버에 전달하면
// 서버가 카카오와 통신해 사용자 조회 후 자체 JWT 발급(없으면 자동 회원가입).
// 실패 코드: 400 INVALID_KAKAO_CODE / 401 KAKAO_TOKEN_FAILED / 502 KAKAO_USER_INFO_FAILED.
export async function kakaoLogin(body: SocialLoginRequest): Promise<SocialLoginResponseData> {
  const res = await api.post<ApiResponse<SocialLoginResponseData>>('/auth/kakao/login', body);
  return res.data.data;
}

// 구글 소셜 로그인 (향후 확장). 카카오와 동일 패턴, loginType=GOOGLE로 구분.
// 실패 코드: 400 INVALID_GOOGLE_CODE / 401 GOOGLE_TOKEN_FAILED.
export async function googleLogin(body: SocialLoginRequest): Promise<SocialLoginResponseData> {
  const res = await api.post<ApiResponse<SocialLoginResponseData>>('/auth/google/login', body);
  return res.data.data;
}
