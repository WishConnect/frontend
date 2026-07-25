export type CuratedCategory = '전체' | '생활비' | '성적우수' | '전공·특기' | '해외연수' | '기타';

export interface CuratedFeaturedScholarship {
  scholarshipId: number;
  title: string;
  organization: string;
  maxAmount: string | null;
  deadline: string | null;
  dDay: number | null;
  matchScore: number;
  matchReasons: string[];
  eligible: boolean;

  // 실제 응답에는 현재 없음
  tags?: string[];
  thumbnailUrl?: string;
  isScrapped?: boolean;
}

export interface CuratedCampusScholarship {
  scholarshipId: number;
  title: string;
  organization: string;
  maxAmount: string | null;
  deadline: string | null;
  dDay: number | null;
  matchScore: number;
  matchReasons: string[];
  eligible: boolean;
  isScrapped?: boolean;
}

export interface CuratedOtherScholarship {
  scholarshipId: number;
  title: string;
  organization: string;
  maxAmount: string | null;
  deadline: string | null;
  dDay: number | null;
  matchScore: number;
  matchReasons: string[];
  eligible: boolean;
  isScrapped?: boolean;
}

export interface Pagination {
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
}

export interface CuratedScholarshipParams {
  category?: CuratedCategory;
  page?: number;
  size?: number;
}

export interface CuratedScholarshipResponse {
  featured: CuratedFeaturedScholarship | null;
  profileCompletionRate: number;
  campusScholarships: CuratedCampusScholarship[];
  otherScholarships: CuratedOtherScholarship[];
  pagination: Pagination;
}
