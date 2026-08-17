export type InsightCategory =
  | 'ALL'
  | 'ACCEPTED'
  | 'SCHOLARSHIP_INFO'
  | 'WRITING_TIP'
  | 'EXPERIENCE'
  | 'QNA';

export type InsightSource = 'ALL' | 'NAVER_BLOG' | 'TISTORY' | 'BRUNCH' | 'EVERYTIME';

export type InsightSort = 'latest' | 'popular';

export interface InsightArticle {
  insightId: number;
  category: string;
  categoryLabel: string;
  source: string;
  publishedAt: string;
  title: string;
  summary: string;
  originalUrl: string;
  tags: string[];
}

export interface InsightPagination {
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
}

export interface InsightData {
  articles: InsightArticle[];
  popularTags: string[];
  pagination: InsightPagination;
}

export interface InsightResponse {
  success: boolean;
  data: InsightData;
  message: string;
}

export interface GetInsightsParams {
  category?: InsightCategory;
  source?: InsightSource;
  sort?: InsightSort;
  tag?: string;
  keyword?: string;
  page?: number;
  size?: number;
}
