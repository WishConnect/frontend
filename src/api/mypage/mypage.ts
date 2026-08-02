import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type {
  MyPageSummary,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  UpdateEmailRequest,
  UpdateEmailResponse,
  CheckEmailRequest,
  CheckEmailResponse,
  SendEmailVerificationRequest,
  SendEmailVerificationResponse,
  VerifyEmailCodeRequest,
  VerifyEmailCodeResponse,
} from '../../types/mypage/mypage';

// 마이페이지 첫 화면에 필요한 사용자 요약 정보 조회
export const getMyPageSummary = () => {
  return api.get<ApiResponse<MyPageSummary>>('/users/me');
};

// 비밀번호 변경 (현재 비밀번호 확인 후 변경, 성공 시 기존 refreshToken 무효화됨)
export const updatePassword = (data: UpdatePasswordRequest) => {
  return api.patch<ApiResponse<UpdatePasswordResponse>>('/users/me/password', data);
};

// 이메일 변경 (인증이 완료된 이메일 주소로 로그인 사용자의 이메일을 변경)
export const updateEmail = (data: UpdateEmailRequest) => {
  return api.patch<ApiResponse<UpdateEmailResponse>>('/users/me/email', data);
};

// 이메일 중복 확인 (마이페이지에서 변경하려는 이메일의 사용 가능 여부)
export const checkEmailDuplicate = (data: CheckEmailRequest) => {
  return api.post<ApiResponse<CheckEmailResponse>>('/users/me/email/check', data);
};

// 이메일 변경 인증코드 발송
export const sendEmailVerification = (data: SendEmailVerificationRequest) => {
  return api.post<ApiResponse<SendEmailVerificationResponse>>('/users/me/email/verification', data);
};

// 이메일 변경 인증코드 확인 (인증 완료 상태 저장)
export const verifyEmailCode = (data: VerifyEmailCodeRequest) => {
  return api.post<ApiResponse<VerifyEmailCodeResponse>>('/users/me/email/verify', data);
};

// 회원 탈퇴 (soft delete + refresh token 삭제). body 없음, 응답 data는 빈 객체.
export const deleteMyAccount = () => {
  return api.delete<ApiResponse<Record<string, never>>>('/users/me');
};
