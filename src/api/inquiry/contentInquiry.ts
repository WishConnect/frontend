import api from '../axios';
import type { ApiResponse } from '../../types/api';

/* 콘텐츠 이용 문의 접수 API.
 *
 * 백엔드: POST /api/v1/content-inquiries (2026-08-19 추가)
 * baseURL 에 /api/v1 이 포함이라 여기선 /content-inquiries 만 적는다.
 * 비회원도 접수할 수 있어 인증이 필요 없다(SecurityConfig permitAll).
 */

// 화면의 라디오 항목과 1:1 로 대응한다(백엔드 ContentInquiryType).
export type ContentInquiryType =
  | 'POSTER_IMAGE_TAKEDOWN'
  | 'SCHOLARSHIP_TAKEDOWN'
  | 'COPYRIGHT_INFRINGEMENT'
  | 'INFORMATION_CORRECTION'
  | 'OTHER';

export type ContentInquiryStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface ContentInquiryRequest {
  inquiryType: ContentInquiryType | null; // 선택
  inquiryTarget: string; // 선택, 최대 200자
  organizationName: string; // 선택, 최대 100자
  email: string; // 필수, 이메일 형식, 최대 254자
  phone: string; // 선택, ^$|^[0-9+() -]{7,30}$
  content: string; // 필수, 최대 500자
}

export interface ContentInquiryData {
  inquiryId: number;
  inquiryType: ContentInquiryType | null;
  inquiryTarget: string | null;
  organizationName: string | null;
  email: string;
  phone: string | null;
  content: string;
  attachmentName: string | null;
  attachmentUrl: string | null; // 15분간 유효한 다운로드 URL
  status: ContentInquiryStatus;
}

// 첨부파일 제약. 서버(InquiryAttachmentStorageService)와 같은 값을 둔다.
// 서버는 확장자뿐 아니라 파일 시그니처까지 확인하므로, 여기서 거르는 건 어디까지나
// 2MB 를 올려보내고 나서야 거절당하는 낭비를 줄이기 위한 것이다.
export const ATTACHMENT_MAX_BYTES = 2 * 1024 * 1024;
export const ATTACHMENT_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg'];

/**
 * 문의 접수. request 는 JSON 파트, attachment 는 선택 파일 파트다.
 *
 * request 를 Blob 으로 감싸는 이유: 서버가 @RequestPart 로 받으므로 그 파트의
 * Content-Type 이 application/json 이어야 한다. 문자열로 그냥 append 하면
 * text/plain 으로 나가 415 가 난다.
 *
 * Content-Type 을 undefined 로 지우는 이유: axios 인스턴스 기본값이 application/json 인데,
 * 그대로 두면 multipart 경계(boundary)가 빠져 서버가 파트를 못 읽는다. 지우면 브라우저가
 * boundary 를 포함한 값을 직접 채운다.
 */
export async function postContentInquiry(
  request: ContentInquiryRequest,
  attachment?: File | null,
): Promise<ContentInquiryData> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
  if (attachment) {
    form.append('attachment', attachment);
  }

  const res = await api.post<ApiResponse<ContentInquiryData>>('/content-inquiries', form, {
    headers: { 'Content-Type': undefined },
  });
  return res.data.data;
}
