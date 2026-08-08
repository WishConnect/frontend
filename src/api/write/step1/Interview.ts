import axios from '../../axios';

export interface InterviewAnswerRequest {
    answers: {
        subQuestionId: number;
        answer: string;
    }[];
}

export interface InterviewAnswerResponse {
    success: boolean;
    data: {
        saved: boolean;
    };
    messgae: string | null;
}

export const putInterviewAnswer = async (
    applicationId: number,
    questionId: number,
    data: InterviewAnswerRequest
): Promise<InterviewAnswerResponse> => {
    const response = await axios.put(
        `applications/${applicationId}/questions/${questionId}/interview`,
        data
    );
    return response.data;
}