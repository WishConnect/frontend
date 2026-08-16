import axios from '../../axios';

export interface InterviewAnswerItem {
    stepOrder: number;
    answerText: string;
}

export interface InterviewQuestionItem {
    stepOrder: number;
    questionText: string;
    answerText: string | null;
}

export interface InterviewAnswerRequest {
    answers: InterviewAnswerItem[] | null;
}

export interface InterviewAnswerResponse {
    success: boolean;
    data: {
        questions: InterviewQuestionItem[];
        canGenerateDraft: boolean;
        isInterviewComplete: boolean;
    };
    message: string | null;
}

export const postInterviewAnswer = async (
    applicationId: number,
    questionId: number,
    answers: InterviewAnswerItem[] | null = null
): Promise<InterviewAnswerResponse> => {
    const response = await axios.post(
        `/applications/${applicationId}/questions/${questionId}/interview`,
        { answers }
    );
    return response.data;
};