import api from '../axios';

import type { HomeSummaryApiResponse, HomeSummaryResponse } from '../../types/Home/Summary';

export async function fetchHomeSummary(): Promise<HomeSummaryResponse> {
  const response = await api.get<HomeSummaryApiResponse>('/scholarships/home-summary');

  const json = response.data;

  if (!json.success || !json.data) {
    throw new Error(json.message ?? '오늘의 장학금 소식을 불러오지 못했습니다.');
  }

  return json.data;
}
