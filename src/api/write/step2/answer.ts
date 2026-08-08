import axios from '../../axios';

export type AnswerAction = 'draft' | 'save' | 'confirm';

export interface AnswerRequest {
    action: AnswerAction;
    userContent: string;
}

export interface AnswerResponse {
    success: boolean;
    data: {
        questionId: number;
        charCount: number;
        charLimit: number;
        isCompleted: boolean;
        applicationCompleted: boolean;
        aiDraft?: string;
    };
    message: string | null;
}

export const putAnswer = async (
    applicationId: number,
    questionId: number,
    body: AnswerRequest
): Promise<AnswerResponse> => {
    const response = await axios.put(
        `/applications/${applicationId}/questions/${questionId}/answer`,
        body
    );
    return response.data;
};