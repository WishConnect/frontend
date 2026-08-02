// 장학금 카드 하나의 데이터 형태: 백엔드 API 붙으면 이 형태에 맞춰 응답을 매핑하면 됨
export type ScholarshipStatus = 'before' | 'in-progress' | 'done';

export interface Scholarship {
  id: string;
  applicationId: number | null;
  title: string;
  imageUrl: string;
  deadline: string;
  dDay: number;
  tags: string[];
  status: ScholarshipStatus;
  questionLabel: string;
  // TODO: status와 별개 필드라 서로 어긋날 수 있음(예: status는 'in-progress'인데 progressPercent가 100).
  // 지금 mock 데이터는 항상 맞게 들어있지만, 실제 API 연동 시 서버 응답이 두 값을 일관되게 주는지 확인 필요
  progressPercent: number;
}
