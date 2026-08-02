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
  insightId: string;
  category: Exclude<InsightCategory, 'ALL'>;
  categoryLabel: string;
  source: string;
  publishedAt: string;
  title: string;
  summary: string;
  originalUrl: string;
}

export interface RecommendedGuide {
  title: string;
  url: string;
}

export interface InsightPagination {
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
}

export interface InsightResponse {
  articles: InsightArticle[];
  popularTags: string[];
  recommendedGuides: RecommendedGuide[];
  pagination: InsightPagination;
}

export interface InsightQueryParams {
  category?: InsightCategory;
  source?: InsightSource;
  sort?: InsightSort;
  tag?: string;
  keyword?: string;
  page?: number;
  size?: number;
}
