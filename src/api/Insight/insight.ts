import api from '../axios';

import type { ApiResponse } from '../../types/api';
import type { InsightQueryParams, InsightResponse } from '../../types/Insight/insight';

export const getInsights = async (params: InsightQueryParams): Promise<InsightResponse> => {
  const response = await api.get<ApiResponse<InsightResponse>>('/insights', {
    params,
  });

  return response.data.data;
};
