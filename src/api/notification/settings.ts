import axios from '../axios';

export interface NotificationSettings {
  notificationEnabled: boolean;
  matchingEnabled: boolean;
  scheduleEnabled: boolean;
  essayEnabled: boolean;
  etcEnabled: boolean;
}

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const response = await axios.get('/notifications/settings');
  return response.data.data;
};

export const putNotificationSettings = async (data: NotificationSettings) => {
  const response = await axios.put('/notifications/settings', data);
  return response.data;
};