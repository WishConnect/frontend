import api from '../axios';

import type { ApiResponse } from '../../types/api';
import type {
  ScholarshipSearchParams,
  ScholarshipSearchResponse,
} from '../../types/Curation/Search';

export async function fetchScholarshipSearch(
  params: ScholarshipSearchParams,
): Promise<ScholarshipSearchResponse> {
  const response = await api.get<ApiResponse<ScholarshipSearchResponse>>('/scholarships/search', {
    params: {
      keyword: params.keyword,
      category: params.category,
      sort: params.sort,
      scrappedOnly: params.scrappedOnly, // ← 추가
      page: params.page ?? 1,
      size: params.size ?? 10,
    },
  });

  const json = response.data;

  if (!json.success || !json.data) {
    throw new Error(json.message ?? '장학금 검색에 실패했습니다.');
  }

  return json.data;
}
