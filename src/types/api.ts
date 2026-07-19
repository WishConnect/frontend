//src/types/api.ts 공통응답형식
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}
