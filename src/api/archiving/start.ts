import axios from '../axios'

export interface ApplicationCreateRequest {
    scholarshipId: number;
}

export interface ApplicationResponse {
    success: boolean;
    data: {
        applicationId: number;
        status: string;
        questionCount: number;
    } | null;
    message: string | null;
}

export const postStartApplication = async (
    data: ApplicationCreateRequest
): Promise<ApplicationResponse> => {
    const response = await axios.post(`/applications`, data);
    return response.data;
};