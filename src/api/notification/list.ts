import api from '../axios';
import type { ApiResponse } from '../../types/api';
import type { NotificationCategory, NotificationItem } from '../../store/useNotificationStore';

// 알림 목록 조회 API. 서버는 목록과 안 읽은 개수를 한 번에 내려준다.
// GET /notifications?type=ALL&page=1&size=10  (page는 1부터, createdAt DESC 정렬)

// 서버 알림 유형. 알림센터 필터 탭 4종과 1:1 대응한다.
export type ServerNotificationType = 'RECOMMENDATION' | 'SCHEDULE' | 'WRITING' | 'ETC';

// 서버 응답 원본 형태 (NotificationListResponse.NotificationItemResponse)
export interface NotificationItemResponse {
  notificationId: number;
  type: ServerNotificationType;
  title: string;
  message: string;
  // 알림이 가리키는 대상. "SCHOLARSHIP"(장학금) 또는 "ESSAY"(작성 중인 지원서)
  relatedType: string | null;
  relatedId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListData {
  unreadCount: number;
  notifications: NotificationItemResponse[];
  pagination: {
    page: number;
    size: number;
    totalCount: number;
    totalPages: number;
  };
}

export const getNotifications = async (page = 1, size = 10): Promise<NotificationListData> => {
  const res = await api.get<ApiResponse<NotificationListData>>('/notifications', {
    params: { type: 'ALL', page, size },
  });
  return res.data.data;
};

// 서버 유형 → 알림센터 필터 탭 라벨
const CATEGORY_BY_TYPE: Record<ServerNotificationType, NotificationCategory> = {
  RECOMMENDATION: '맞춤 장학금',
  SCHEDULE: '일정',
  WRITING: '작성',
  ETC: '기타',
};

// CTA 문구는 서버가 주지 않으므로 유형별로 프론트에서 정한다 (Figma node 1122:2842 기준)
const CTA_LABEL_BY_TYPE: Record<ServerNotificationType, string> = {
  RECOMMENDATION: '바로 보기 →',
  SCHEDULE: '바로 보기 →',
  WRITING: '이어서 작성하기 →',
  ETC: '바로 보기 →',
};

// relatedType/relatedId를 실제 이동 경로로 변환.
// ESSAY의 relatedId는 essayId인데 이 값이 곧 applicationId라서 /write/{id}로 바로 쓸 수 있다.
// 대상 정보가 없는 알림은 갈 곳이 없으므로 알림센터 목록(홈)으로 보낸다.
function toLink(relatedType: string | null, relatedId: number | null): string {
  if (relatedId === null) return '/';
  if (relatedType === 'SCHOLARSHIP') return `/curation/${relatedId}`;
  if (relatedType === 'ESSAY') return `/write/${relatedId}`;
  return '/';
}

// createdAt(ISO 문자열)을 "2분 전" 같은 상대 시간으로 변환.
// 7일이 넘어가면 상대 표기가 오히려 헷갈려서 날짜로 떨어뜨린다.
export function formatTimeAgo(createdAt: string): string {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return '';

  const diffSec = Math.floor((Date.now() - created) / 1000);
  if (diffSec < 60) return '방금 전';
  if (diffSec < 60 * 60) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 60 * 60 * 24) return `${Math.floor(diffSec / 3600)}시간 전`;

  const diffDay = Math.floor(diffSec / (60 * 60 * 24));
  if (diffDay === 1) return '어제';
  if (diffDay < 7) return `${diffDay}일 전`;

  const date = new Date(created);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// 서버 응답을 알림센터 패널이 쓰는 형태로 변환
export function toNotificationItems(responses: NotificationItemResponse[]): NotificationItem[] {
  return responses.map((item) => ({
    id: item.notificationId,
    category: CATEGORY_BY_TYPE[item.type] ?? '기타',
    timeAgo: formatTimeAgo(item.createdAt),
    title: item.title,
    description: item.message,
    ctaLabel: CTA_LABEL_BY_TYPE[item.type] ?? '바로 보기 →',
    link: toLink(item.relatedType, item.relatedId),
    isRead: item.isRead,
  }));
}
