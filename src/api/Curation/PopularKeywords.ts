import api from '../axios';

import type { ApiResponse } from '../../types/api';

interface PopularKeywordsData {
  keywords: string[];
}

export async function fetchPopularKeywords(): Promise<string[]> {
  const response = await api.get<ApiResponse<PopularKeywordsData>>(
    '/scholarships/search/popular-keywords',
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message ?? '추천 검색어를 불러오지 못했습니다.');
  }

  return response.data.data.keywords ?? [];
}
