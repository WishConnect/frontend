import api from '../axios';

import type {
  ScrapScholarshipApiResponse,
  ScrapScholarshipResponse,
} from '../../types/Curation/Scrap';

export async function scrapScholarship(
  scholarshipId: number | string,
): Promise<ScrapScholarshipResponse> {
  const response = await api.post<ScrapScholarshipApiResponse>(
    `/scholarships/${scholarshipId}/scrap`,
  );

  return response.data.data;
}

export async function unscrapScholarship(
  scholarshipId: number | string,
): Promise<ScrapScholarshipResponse> {
  const response = await api.delete<ScrapScholarshipApiResponse>(
    `/scholarships/${scholarshipId}/scrap`,
  );

  return response.data.data;
}
