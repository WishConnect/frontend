import axios from '../axios';

export type InterviewRequirement = 'REQUIRED' | 'CONDITIONAL' | 'NOT_REQUIRED' | null;

export interface InterviewQuestion {
    displayOrder: number;
    questionText: string;
    intent: string;
}

export interface InterviewQuestionsData {
    questions: InterviewQuestion[];
    totalCount: number;
    interviewRequirement: InterviewRequirement;
    interviewEvidence: string | null;
}

export interface InterviewQuestionsResponse {
    success: boolean;
    data: InterviewQuestionsData;
    message: string | null;
}

export const getInterviewQuestions = async (
    scholarshipId: number | string
): Promise<InterviewQuestionsResponse> => {
    const response = await axios.get(`/scholarships/${scholarshipId}/interview-questions`);
    return response.data;
};

export const postInterviewQuestions = async (
    scholarshipId: number | string
): Promise<InterviewQuestionsResponse> => {
    const response = await axios.post(`/scholarships/${scholarshipId}/interview-questions`);
    return response.data;
};