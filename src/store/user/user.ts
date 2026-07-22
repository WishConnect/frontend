import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../types/login/auth';

// 로그인한 유저 정보를 전역 관리. 기본/카카오/구글 로그인 모두 이 스토어에 저장.
// 다른 페이지는 여기서 유저정보(이름/온보딩 여부 등)를 꺼내 사용.
interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User) => void; // 로그인 성공 시 저장
  clearUser: () => void; // 로그아웃 시 초기화
}

// persist: 새로고침해도 localStorage('user-storage')에서 복원돼 로그인 상태 유지.
// (토큰은 별도로 tokenStorage(localStorage)에 저장됨)
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      setUser: (user) => set({ user, isLoggedIn: true }),
      clearUser: () => set({ user: null, isLoggedIn: false }),
    }),
    { name: 'user-storage' },
  ),
);
