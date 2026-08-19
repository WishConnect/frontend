// api/Curation/Curated.ts
import api from '../axios';

import type { ApiResponse } from '../../types/api';
import type {
  CuratedScholarshipParams,
  CuratedScholarshipResponse,
} from '../../types/Curation/Curated';

export async function fetchCuratedScholarships(
  params: CuratedScholarshipParams = {},
): Promise<CuratedScholarshipResponse> {
  const response = await api.get<ApiResponse<CuratedScholarshipResponse>>('/scholarships/curated', {
    params: {
      category: params.category,
      sort: params.sort,
      page: params.page ?? 1,
      size: params.size ?? 10,
    },
  });

  const json = response.data;

  if (!json.success || !json.data) {
    throw new Error(json.message ?? '맞춤 장학금을 불러오지 못했습니다.');
  }

  return json.data;
}
