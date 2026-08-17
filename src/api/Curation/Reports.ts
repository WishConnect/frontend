import axios from '../axios';

export interface ReportRequest {
    reason: string;
    detail: string;
}

export interface ReportData {
    reportId: number;
    scholarshipId: string;
    scholarshipTitle: string;
    reason: string;
    detail: string;
    status: string;
    adminNote: string;
    createdAt: string;
    resolvedAt: string;
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