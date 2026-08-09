import axios from '../../axios';

export interface InterviewAnswerRequest {
    stepOrder: number;
    answerText: string;
}

export interface InterviewAnswerResponse {
    success: boolean;
    data: {
        nextStepOrder: number;
        nextQuestion: string;
        isInterviewComplete: boolean;
    };
    message: string | null;
}

export const postInterviewAnswer = async (
    applicationId: number,
    questionId: number,
    data: InterviewAnswerRequest
): Promise<InterviewAnswerResponse> => {
    const response = await axios.post(
        `/applications/${applicationId}/questions/${questionId}/interview`,
        data
    );
    return response.data;
};