// src/types/archiving/archive.ts

export type ArchiveStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface ArchiveCounts {
  all: number;
  notStarted: number;
  inProgress: number;
  completed: number;
}

export interface ArchiveProgress {
  completedQuestions: number;
  totalQuestions: number;
  percentage: number;
}

export interface ArchiveItem {
  scholarshipId: number;
  applicationId: number | null;
  isScrapped: boolean;
  title: string;
  tags: string[];
  deadline: string;
  dDay: number;
  urgency: string;
  posterUrl: string;
  applicationStatus: ArchiveStatus | null;
  progress: ArchiveProgress;
}

export interface ArchivePagination {
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
}

export interface ArchiveData {
  counts: ArchiveCounts;
  items: ArchiveItem[];
  pagination: ArchivePagination;
}

export interface ArchiveResponse {
  success: boolean;
  data: ArchiveData;
  message: string;
}

export interface GetArchiveParams {
  status?: ArchiveStatus;
  keyword?: string;
  page?: number;
  size?: number;
}
