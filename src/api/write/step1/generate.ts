import axios from '../../axios';

export type QuestionGenerateSource = 'GENERATED' | 'DEFAULT';

export interface GeneratedQuestionItem {
    displayOrder: number;
    questionText: string;
    intent: string;
}

export interface QuestionGenerateData {
    source: QuestionGenerateSource;
    questions: GeneratedQuestionItem[];
    reason: string | null;
}

export interface QuestionGenerateResponse {
    success: boolean;
    data: QuestionGenerateData;
    message: string | null;
}

export const generateApplicationQuestions = async (
    applicationId: number
): Promise<QuestionGenerateResponse> => {
    const response = await axios.post(`/applications/${applicationId}/questions/generate`);
    return response.data;
};