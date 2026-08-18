export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export type ScholarshipStatus = 'OPEN' | 'CLOSED' | 'UPCOMING';

export type SelectionScheduleStatus = 'CLOSED' | 'UPCOMING' | 'CURRENT';
export type RequirementStatus = 'REQUIRED' | 'CONDITIONAL' | 'NOT_REQUIRED';

export interface ScholarshipSelection {
  essayRequirement: RequirementStatus | null;
  essayEvidence: string | null;
  interviewRequirement: RequirementStatus | null;
  interviewEvidence: string | null;
}
export interface ScholarshipDetailSummary {
  targetAudience: string | null;
  supportAmount: string | null;
  selectedCount: string | null;
  fieldOfStudy: string | null;
  supportType: string | null;
  duplicateAllowed: string | null;
  operatingOrganization: string | null;
  contactInfo: string | null;
  selectionCriteria: string | null;
  gpaRequirement: string | null;
  incomeRequirement: string | null;
  preferredConditions: string | null;
  applicationPeriod: string | null;
  submissionMethod: string | null;
}

export interface ScholarshipSelectionSchedule {
  step: string;
  date: string | null;
  status: SelectionScheduleStatus;
}

export interface ScholarshipRequiredDocument {
  name: string;
  downloadUrl: string | null;
}

export interface ScholarshipDetailResponse {
  scholarshipId: number | string;
  title: string;
  organization: string;
  status: ScholarshipStatus;
  deadline: string | null;
  dDay: number | null;
  isScrapped: boolean;
  tags: string[];
  posterUrl: string | null;
  detailUrl: string | null;
  summary: ScholarshipDetailSummary;
  selectionSchedule: ScholarshipSelectionSchedule[];
  requiredDocuments: ScholarshipRequiredDocument[];
  matchReasons: string[];
  selection: ScholarshipSelection;
}

export type ScholarshipDetailApiResponse = ApiResponse<ScholarshipDetailResponse>;
