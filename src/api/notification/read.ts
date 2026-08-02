import axios from '../axios';

export const patchMarkAsRead = async (notificationId: number) => {
    const response = await axios.patch(`/notifications/${notificationId}/read`);
    return response.data;
};