// src/api/Curation/Events.ts
import api from '../axios';

import type { ApiResponse } from '../../types/api';
import type { CuratedViewMode } from '../../types/Curation/Curated';

export interface ScholarshipEvent {
  scholarshipId: number;
  eventType: 'IMPRESSION' | 'CLICK';
  position: number;
  matchScore: number;
  viewMode: CuratedViewMode;
  section: string;
  rankerVersion: string;
}

export async function postScholarshipEvents(events: ScholarshipEvent[]): Promise<number> {
  const response = await api.post<ApiResponse<number>>('/scholarships/events', { events });

  if (!response.data.success) {
    throw new Error(response.data.message ?? '추천 이벤트 기록에 실패했습니다.');
  }

  return response.data.data;
}
