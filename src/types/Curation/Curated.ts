export type CuratedCategory = '전체' | '생활비' | '성적우수' | '전공·특기' | '해외연수' | '기타';

export type CuratedSort = 'DEADLINE' | 'LATEST';

export type CuratedViewMode = 'GUEST' | 'ONBOARDING_REQUIRED' | 'PERSONALIZED';

export interface CuratedFeaturedScholarship {
  section: string;

  scholarshipId: number;
  title: string;
  organization: string;

  posterUrl: string | null;
  maxAmount: string | null;

  deadline: string | null;
  deadlineAt: string | null;
  dDay: number | null;

  matchScore: number;
  matchReasons: string[];

  eligible: boolean;
  isScrapped: boolean;

  tags?: string[];
  thumbnailUrl?: string;
}

export interface CuratedCampusScholarship {
  section: string;

  scholarshipId: number;
  title: string;
  organization: string;

  posterUrl: string | null;
  maxAmount: string | null;

  deadline: string | null;
  deadlineAt: string | null;
  dDay: number | null;

  matchScore: number;
  matchReasons: string[];

  eligible: boolean;
  isScrapped: boolean;
}

export interface CuratedOtherScholarship {
  section: string;

  scholarshipId: number;
  title: string;
  organization: string;

  posterUrl: string | null;
  maxAmount: string | null;

  deadline: string | null;
  deadlineAt: string | null;
  dDay: number | null;

  matchScore: number;
  matchReasons: string[];

  eligible: boolean;
  isScrapped: boolean;

  tags?: string[];
}

export interface Pagination {
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
}

export interface CuratedScholarshipParams {
  category?: CuratedCategory;
  sort?: CuratedSort;
  page?: number;
  size?: number;
}

export interface CuratedScholarshipResponse {
  viewMode: CuratedViewMode;

  rankerVersion: string;

  featured: CuratedFeaturedScholarship[];

  profileCompletionRate: number;

  campusScholarships: CuratedCampusScholarship[];
  otherScholarships: CuratedOtherScholarship[];
  ineligibleScholarships: CuratedOtherScholarship[];

  pagination: Pagination;
}
