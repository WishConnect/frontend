import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type {
  NaverLoginRequest,
  SocialLoginRequest,
  SocialLoginResponseData,
} from '../../types/login/auth';

// 카카오 소셜 로그인. 프론트가 카카오에서 받은 인가코드(code)를 서버에 전달하면
// 서버가 카카오와 통신해 사용자 조회 후 자체 JWT 발급(없으면 자동 회원가입).
// 실패 코드: 400 INVALID_KAKAO_CODE / 400 INVALID_REDIRECT_URI / 401 KAKAO_TOKEN_FAILED
//          / 502 KAKAO_USER_INFO_FAILED.
export async function kakaoLogin(body: SocialLoginRequest): Promise<SocialLoginResponseData> {
  const res = await api.post<ApiResponse<SocialLoginResponseData>>('/auth/kakao/login', body);
  return res.data.data;
}

// 구글 소셜 로그인 (향후 확장). 카카오와 동일 패턴, loginType=GOOGLE로 구분.
// 실패 코드: 400 INVALID_GOOGLE_CODE / 400 INVALID_REDIRECT_URI / 401 GOOGLE_TOKEN_FAILED.
export async function googleLogin(body: SocialLoginRequest): Promise<SocialLoginResponseData> {
  const res = await api.post<ApiResponse<SocialLoginResponseData>>('/auth/google/login', body);
  return res.data.data;
}

// 네이버 소셜 로그인. 카카오/구글과 달리 code + state를 함께 보낸다.
// 실패 코드: 400 INVALID_NAVER_CODE / 400 INVALID_NAVER_STATE.
export async function naverLogin(body: NaverLoginRequest): Promise<SocialLoginResponseData> {
  const res = await api.post<ApiResponse<SocialLoginResponseData>>('/auth/naver/login', body);
  return res.data.data;
}
