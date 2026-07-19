const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ID_KEY = 'userId';

export const tokenStorage = {
  setTokens: (accessToken: string, refreshToken: string, userId: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_ID_KEY, userId);
  },

  setAccessToken: (accessToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  },

  getAccessToken: () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUserId: () => {
    return localStorage.getItem(USER_ID_KEY);
  },

  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
  },
};
