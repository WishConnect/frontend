import axios from '../../axios';

export interface SubQuestion {
    id: number;
    text: string;
    hint: string;
}

export interface Question {
    questionId: string;
    title: string;
    subQuestions: SubQuestion[];
}

export interface WritingTip {
    icon: string;
    title: string;
    description: string;
}

export interface InterviewTemplateResponse {
    success: boolean;
    data: {
        questions: Question[];
        writingTips: WritingTip[];
    };
    message: string | null;
}

export const getInterviewTemplate = async (
    scholarshipId: number
): Promise<InterviewTemplateResponse> => {
    const response = await axios.get(
        `/scholarships/${scholarshipId}/interview-template`
    );
    return response.data;
};