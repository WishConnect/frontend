import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../utils/token';
import type { ApiResponse } from '../types/api';
import type { TokenRefreshResponseData } from '../types/login/auth';

// 개발(npm run dev): 상대주소 '/api/v1' → vite.config 프록시가 실제 서버로 전달(CORS 우회).
// 운영 빌드: .env의 절대주소(VITE_API_BASE_URL) 그대로 사용.
const baseURL = import.meta.env.DEV ? '/api/v1' : import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 리프레시 전용 클라이언트: 아래 응답 인터셉터가 없어서, 토큰 갱신 요청 자체가
// 다시 401 → 갱신 로직을 타는 무한루프를 만들지 않음.
const refreshClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 토큰 갱신은 여러 요청이 동시에 401을 맞아도 한 번만 수행(single-flight).
// 진행 중인 갱신 요청을 공유해 refresh 중복 호출을 막는다.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error('refreshToken 없음');

  const res = await refreshClient.post<ApiResponse<TokenRefreshResponseData>>('/auth/refresh', {
    refreshToken,
  });
  const data = res.data.data;
  // 갱신 응답엔 userId가 없으므로 기존에 저장해둔 userId를 유지한다.
  tokenStorage.setTokens(data.accessToken, data.refreshToken, tokenStorage.getUserId() ?? '');
  return data.accessToken;
}

// auth 자체 엔드포인트(로그인/회원가입/갱신/소셜)는 401이어도 갱신 대상이 아님.
// (로그인 실패 401까지 갱신을 시도해 로그인 페이지로 튕기는 걸 방지)
const AUTH_PATHS = [
  '/auth/login',
  '/auth/signup',
  '/auth/refresh',
  '/auth/logout',
  '/auth/kakao/login',
  '/auth/google/login',
  // 아이디 중복 확인. 로그인 전에 부르는 엔드포인트라 401이 나도 갱신 대상이 아니다.
  // 빼먹으면 회원가입 도중 401 한 번에 토큰이 지워지고 /login으로 튕긴다.
  '/auth/login-id/check',
  // 아이디 찾기도 로그인 전 화면에서 부른다.
  '/auth/login-id/find',
];

// 401(만료 토큰) 응답 시: refreshToken으로 새 토큰 발급 후 원요청을 1회 재시도.
// 갱신도 실패하면 토큰을 비우고 로그인 페이지로 보낸다.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const isAuthPath = AUTH_PATHS.some((path) => original?.url?.includes(path));

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthPath &&
      tokenStorage.getRefreshToken()
    ) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newAccessToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original);
      } catch (refreshError) {
        tokenStorage.clearTokens();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
