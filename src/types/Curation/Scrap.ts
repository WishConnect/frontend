import type { ApiResponse } from '../api';

export interface ScrapScholarshipResponse {
  scrapped: boolean;
}

export type ScrapScholarshipApiResponse = ApiResponse<ScrapScholarshipResponse>;
