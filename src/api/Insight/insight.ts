import api from '../axios';

import type { GetInsightsParams, InsightData, InsightResponse } from '../../types/Insight/insight';

export const getInsights = async (params: GetInsightsParams = {}): Promise<InsightData> => {
  const response = await api.get<InsightResponse>('/insights', {
    params: {
      category: params.category,
      source: params.source,
      sort: params.sort ?? 'latest',
      tag: params.tag,
      keyword: params.keyword,
      page: params.page ?? 1,
      size: params.size ?? 10,
    },
  });

  return response.data.data;
};
