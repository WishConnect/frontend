import axios from '../axios';

export const deleteAllNotifications = async () => {
    const response = await axios.delete('/notifications');
    return response.data;
};