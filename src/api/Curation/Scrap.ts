import api from '../axios';

import type {
  ScrapScholarshipApiResponse,
  ScrapScholarshipResponse,
} from '../../types/Curation/Scrap';

export async function scrapScholarship(
  scholarshipId: number | string,
): Promise<ScrapScholarshipResponse> {
  const response = await api.post<ScrapScholarshipApiResponse>(`/archive/${scholarshipId}/scrap`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message ?? '장학금 저장에 실패했습니다.');
  }

  return response.data.data;
}

export async function unscrapScholarship(
  scholarshipId: number | string,
): Promise<ScrapScholarshipResponse> {
  const response = await api.delete<ScrapScholarshipApiResponse>(`/archive/${scholarshipId}/scrap`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message ?? '장학금 저장 해제에 실패했습니다.');
  }

  return response.data.data;
}
