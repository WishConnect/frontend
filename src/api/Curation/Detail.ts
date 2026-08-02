import api from '../axios';

import type {
  ScholarshipDetailApiResponse,
  ScholarshipDetailResponse,
} from '../../types/Curation/Detail';

export async function fetchScholarshipDetail(
  scholarshipId: string,
): Promise<ScholarshipDetailResponse> {
  const response = await api.get<ScholarshipDetailApiResponse>(`/scholarships/${scholarshipId}`);

  if (!response.data.success) {
    throw new Error(response.data.message ?? '장학금 상세 조회에 실패했습니다.');
  }

  return response.data.data;
}
