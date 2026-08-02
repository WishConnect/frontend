import type { ApiResponse } from '../api';

export interface HomeSummaryResponse {
  newMatchedCount: number;
  urgentDeadlineCount: number;
  hasNewMatched: boolean;
}

export type HomeSummaryApiResponse = ApiResponse<HomeSummaryResponse>;
