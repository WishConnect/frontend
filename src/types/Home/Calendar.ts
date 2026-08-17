import type { ApiResponse } from '../api';

export type CalendarScope = 'MATCHED' | 'SCRAPPED' | 'ALL';

export type CalendarEventType = 'START' | 'DEADLINE';

export interface CalendarEvent {
  date: string;
  type: CalendarEventType;
  scholarshipId: number;
  title: string;
  organization: string;
}

export interface HomeCalendarResponse {
  year: number;
  month: number;
  scope: CalendarScope;
  markedDates: string[];
  events: CalendarEvent[];
}

export interface GetHomeCalendarParams {
  year?: number;
  month?: number;
  scope?: CalendarScope;
}

export type HomeCalendarApiResponse = ApiResponse<HomeCalendarResponse>;
