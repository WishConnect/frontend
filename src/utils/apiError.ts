import { isAxiosError } from 'axios';
import type { ApiResponse } from '../types/api';

// 실패한 API 호출에서 사용자에게 보여줄 문구를 꺼낸다.
// 백엔드가 ApiResponse.message에 한국어 안내를 담아주므로(예: "이미 가입된 이메일입니다.")
// 그 값을 우선 쓰고, 네트워크 끊김처럼 응답 자체가 없을 때만 fallback을 쓴다.
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiResponse<null>>(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  return fallback;
}
