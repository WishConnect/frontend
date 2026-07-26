import axios from '../../axios';

export interface AiDraftResponse {
    success: boolean;
    data: {
        aiDraft: string;
        charCount: number;
    };
    message: string | null;
}

export const postAiDraft = async (
    applicationId: number,
    questionId: number
): Promise<AiDraftResponse> => {
    const response = await axios.post(
        `/applications/${applicationId}/questions/${questionId}/generate`
    );
    return response.data;
};