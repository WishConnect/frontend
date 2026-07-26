import axios from '../../axios';

export interface ApplicationCompleteResponse {
    success: boolean;
    data: {
        status: string;
        completedAt: string;
        questions: {
            questionId: string;
            title: string;
            finalContent: string;
            charCount: number;
        }[];
    };
    message: string | null;
}

export const postComplete = async (
    applicationId: number
): Promise<ApplicationCompleteResponse> => {
    const response = await axios.post(
        `/applications/${applicationId}/complete`
    );
    return response.data;
};