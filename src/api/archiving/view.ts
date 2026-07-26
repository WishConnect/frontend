import axios from '../axios'

export interface Interview {
    stepOrder: number;
    questionText: string;
    answerText: string;
}

export interface Answer {
    aiDraft: string;
    userContent: string;
    charCount: number;
    isTemporary: boolean;
    isCompleted: boolean;
}

export interface ApplicationQuestion {
    questionId: number;
    order: number;
    title: string;
    description: string;
    charLimit: number;
    currentStep: string;
    seedQuestion: string;
    interviews: Interview[];
    answer: Answer | null;
}

export interface ApplicationDetailResponse {
    success: boolean;
    data: {
        applicationId: number;
        scholarshipTitle: string;
        status: string;
        lastEditedAt: string;
        questions: ApplicationQuestion[];
    };
    message: string | null;
}

export const getApplicationDetail = async (
    applicationId: number
): Promise<ApplicationDetailResponse> => {
    const response = await axios.get(`/applications/${applicationId}`);
    return response.data;
};