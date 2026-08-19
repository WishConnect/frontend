import axios from '../axios';

// 신고 사유. 백엔드 ReportReason enum 과 1:1 로 맞춰야 한다.
// (enum 에 WRONG_DEADLINE·WRONG_AMOUNT·BROKEN_LINK 도 남아 있지만 화면에서 내려간 옛 값이라
//  새 신고에는 쓰지 않는다. 기존 신고 조회에서만 올라온다.)
export type ReportReason =
    | 'ALREADY_CLOSED'
    | 'WRONG_INFO'
    | 'WRONG_CONDITION'
    | 'DUPLICATE'
    | 'OTHER'
    // 아래 3개는 예전에 접수된 신고를 조회할 때만 올라온다.
    | 'WRONG_DEADLINE'
    | 'WRONG_AMOUNT'
    | 'BROKEN_LINK';

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

// 화면이 체크박스 다중 선택이라 사유를 배열로 보낸다(백엔드 2838331 에서 단수 → 배열로 바뀜).
// 사유마다 따로 요청하면 안 된다 — 같은 장학금에 미처리 신고가 있으면 서버가 409 로 막는다.
export interface ReportRequest {
    reasons: ReportReason[];
    detail: string; // 선택. 최대 200자
}

export interface ReportData {
    reportId: number;
    scholarshipId: number;
    scholarshipTitle: string;
    reasons: ReportReason[];
    detail: string;
    status: ReportStatus;
    adminNote: string | null;
    createdAt: string;
    resolvedAt: string | null;
}

export interface ReportResponse {
    success: boolean;
    data: ReportData;
    message: string | null;
}

export const postScholarshipReport = async (
    scholarshipId: number | string,
    body: ReportRequest
): Promise<ReportResponse> => {
    const response = await axios.post(`/scholarships/${scholarshipId}/reports`, body);
    return response.data;
};
