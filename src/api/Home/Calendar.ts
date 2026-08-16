import api from '../axios';

import type {
  GetHomeCalendarParams,
  HomeCalendarApiResponse,
  HomeCalendarResponse,
} from '../../types/Home/Calendar';

export async function fetchHomeCalendar(
  params: GetHomeCalendarParams = {},
): Promise<HomeCalendarResponse> {
  const response = await api.get<HomeCalendarApiResponse>('/scholarships/calendar', {
    params: {
      year: params.year,
      month: params.month,
      scope: params.scope ?? 'MATCHED',
    },
  });

  const json = response.data;

  if (!json.success || !json.data) {
    throw new Error(json.message ?? '장학금 일정을 불러오지 못했습니다.');
  }

  return json.data;
}
