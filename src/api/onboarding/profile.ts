import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type {
  BasicProfileRequest,
  AcademicProfileRequest,
  HouseholdProfileRequest,
  OnboardingStepResponse,
  OnboardingCompleteResponse,
  FullProfile,
  University,
  Major,
} from '../../types/onboarding/profile';

// 온보딩 STEP1 - 기본 정보 저장
export const putBasicProfile = (data: BasicProfileRequest) => {
  return api.put<ApiResponse<OnboardingStepResponse>>('/users/me/profile/basic', data);
};

// 온보딩 STEP2 - 학적 정보 저장
export const putAcademicProfile = (data: AcademicProfileRequest) => {
  return api.put<ApiResponse<OnboardingStepResponse>>('/users/me/profile/academic', data);
};

// 온보딩 STEP3 - 가구 정보 & 관심사 저장
export const putHouseholdProfile = (data: HouseholdProfileRequest) => {
  return api.put<ApiResponse<OnboardingStepResponse>>('/users/me/profile/household', data);
};

// 온보딩 STEP4 - 온보딩 완료 처리 (STEP1~3 저장 후에만 호출 가능, body 없음)
export const completeOnboarding = () => {
  return api.post<ApiResponse<OnboardingCompleteResponse>>('/users/me/profile/complete');
};

// 내 프로필 전체 조회 (온보딩 진행 단계 포함)
export const getMyProfile = () => {
  return api.get<ApiResponse<FullProfile>>('/users/me/profile');
};

// 학교명 키워드 검색 (온보딩 학교 선택용)
export const searchUniversities = (keyword: string) => {
  return api.get<ApiResponse<University[]>>('/universities/search', {
    params: { keyword },
  });
};

// 전공명 키워드 검색 (온보딩 전공 선택용)
export const searchMajors = (keyword: string) => {
  return api.get<ApiResponse<Major[]>>('/majors/search', {
    params: { keyword },
  });
};
