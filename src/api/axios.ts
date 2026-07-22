import axios from 'axios';
import { tokenStorage } from '../utils/token';

// 개발(npm run dev): 상대주소 '/api/v1' → vite.config 프록시가 실제 서버로 전달(CORS 우회).
// 운영 빌드: .env의 절대주소(VITE_API_BASE_URL) 그대로 사용.
const api = axios.create({
  baseURL: import.meta.env.DEV ? '/api/v1' : import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
