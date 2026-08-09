import axios from '../axios'; 

export type ApplicationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | undefined;

export interface ApplicationItem {
  applicationId: number;
  scholarshipId: number;
  scholarshipTitle: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progress: {
    completed: number;
    total: number;
  };
  lastEditedAt: string;
}

export interface ApplicationListResponse {
  success: boolean;
  data: {
    content: ApplicationItem[];
    totalElements: number;
  };
  message: string | null;
}

export const getApplications = async (
  status?: ApplicationStatus,
  page: number = 0, 
  size: number = 1
): Promise<ApplicationListResponse> => {
  const response = await axios.get('/applications', {
    params: {
      status,
      page,
      size,
      sort: 'updatedAt,desc'
    }
  });
  return response.data;
};