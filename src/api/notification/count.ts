import axios from '../axios';

export interface NotificationResponse {
    success: boolean;
    data: {
        unreadCount: number;
        notifications: any[];
        pagination: any;
    };
    message: string | null;
}

export const getUnreadNotificationCount = async (): Promise<number> => {
    const response = await axios.get('/notifications', {
        params: {
            type: 'ALL',
            page: 1,
            size: 10
        }
    });
    
    return response.data.data.unreadCount;
};