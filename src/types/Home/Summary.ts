import type { ApiResponse } from '../api';

export interface HomeSummaryResponse {
  userName: string;
  newMatchedCount: number;
  urgentDeadlineCount: number;
  writingApplicationCount: number;
  newInsightCount: number;
  hasNewMatched: boolean;
}

export type HomeSummaryApiResponse = ApiResponse<HomeSummaryResponse>;
