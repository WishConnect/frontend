import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
}

// 로그인 유저 상태: 백엔드 연동 전이라 login()은 입력값을 그대로 mock 유저로 세팅
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  login: (email, password) => {
    if (!email || !password) return;
    set({
      user: { id: 'mock-user', name: email.split('@')[0], email },
      isLoggedIn: true,
    });
  },
  logout: () => set({ user: null, isLoggedIn: false }),
}));
