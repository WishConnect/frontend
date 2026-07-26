import axios from '../../axios';

export interface RevisionRequest {
    content: string;
    charCount: number;
}

export interface RevisionResponse {
    success: boolean;
    data: {
        saved: boolean;
        updatedAt: string;
    };
    message: string | null;
}

export const putSaveDraft = async (
    applicationId: number,
    questionId: number,
    data: RevisionRequest
): Promise<RevisionResponse> => {
    const response = await axios.put(
        `/applications/${applicationId}/questions/${questionId}/revision`,
        data
    );
    return response.data;
};