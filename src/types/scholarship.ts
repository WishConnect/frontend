// 장학금 카드 하나의 데이터 형태 — 백엔드 API 붙으면 이 형태에 맞춰 응답을 매핑하면 됨
export type ScholarshipStatus = 'before' | 'in-progress' | 'done';

export interface Scholarship {
  id: string;
  title: string;
  imageUrl: string;
  deadline: string;
  dDay: number;
  tags: string[];
  status: ScholarshipStatus;
  questionLabel: string;
  progressPercent: number;
}
