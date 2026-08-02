import type { ApiResponse } from '../api';

export type SortOption = '마감 임박순' | '최신순' | '높은 금액순' | '저장한 장학금';

export type SortParam = 'deadline' | 'latest' | 'amount';
export type RecruitStatus = 'OPEN' | 'CLOSED';

export interface ScholarshipSearchItem {
  scholarshipId: number;
  title: string;
  organization: string;
  applicationPeriod: string;
  maxAmount: string;
  deadline: string;
  dDay: number;
  recruitStatus: RecruitStatus;
  tags: string[];
  isScrapped: boolean;
}

export interface Pagination {
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
}

export interface ScholarshipSearchResponse {
  keyword: string;
  totalCount: number;
  results: ScholarshipSearchItem[];
  pagination: Pagination;
}

export interface ScholarshipSearchParams {
  keyword?: string;
  category?: string;
  sort?: SortParam;
  scrappedOnly?: boolean; // ← 추가: true면 서버가 스크랩한 것만 필터링
  page?: number;
  size?: number;
}

export interface SearchScholarshipRowData {
  id: string;
  title: string;
  days: number;
  deadline: string;
  recruitStatus: RecruitStatus;
  tags: string[];
  isScrapped: boolean;
  summary: {
    amount: string;
    organization: string;
    applicationPeriod: string;
  };
}

export type ScholarshipSearchApiResponse = ApiResponse<ScholarshipSearchResponse>;
