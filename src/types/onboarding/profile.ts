// STEP1 요청 body
export interface BasicProfileRequest {
  name: string;
  birthDate: string;
  phone: string;
  gender: string;
  nationality: string;
  region: string;
}

// STEP2 요청 body
export interface AcademicProfileRequest {
  university: string;
  majorCategory: string;
  majorName: string;
  enrollmentStatus: string;
  grade: string;
  semesterGpa: number;
  cumulativeGpa: number;
  dualMajor: string;
}

// STEP3 요청 body
export interface HouseholdProfileRequest {
  incomeLevel: string;
  familySize: number;
  familyTypes: string[];
  personalStatuses: string[];
  interests: string[];
}

// 온보딩 STEP 저장 API 공통 응답 data
export interface OnboardingStepResponse {
  step: number;
  completed: boolean;
}

// STEP4 응답 data (POST /users/me/profile/complete)
export interface OnboardingCompleteResponse {
  onboardingCompleted: boolean;
}

// GET /users/me/profile 응답 data — 프로필 전체 조회
export interface FullProfile {
  userId: string;
  name: string;
  // 실제 응답 필드명은 birthYear가 아니라 birthDate ("yyyy-MM-dd" 전체 날짜).
  birthDate: string;
  phone: string;
  gender: string;
  nationality: string;
  region: string;
  profileCompletionRate: number;
  onboardingCompleted: boolean;
  academic: {
    university: string;
    majorCategory: string;
    majorName: string;
    enrollmentStatus: string;
    grade: string;
    semesterGpa: number;
    cumulativeGpa: number;
    dualMajor: string;
  };
  household: {
    // 소득분위를 "모름"으로 저장한 경우 null로 옴
    incomeLevel: string | null;
    familySize: number;
    familyTypes: string[];
    personalStatuses: string[];
  };
  interests: string[];
}

// 학교 검색 결과 항목 (GET /universities/search)
export interface University {
  id: number;
  name: string;
  region: string;
}

// 전공 검색 결과 항목 (GET /majors/search)
export interface Major {
  id: number;
  name: string;
  category: string;
}
