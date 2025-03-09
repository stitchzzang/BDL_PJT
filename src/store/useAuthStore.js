import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  // userData만 전역 상태 관리
  userData: { id: null, email: null, nickname: null }, // const {id, email, nickname} = useAuthStore((state) => state.userData) 형식으로 사용
  isLogin: false,
  isInitialized: false,

  // 토큰 저장 및 userData 업데이트
  loginAuth: (token) => {
    const decoded = jwtDecode(token);
    localStorage.setItem('accessToken', token);
    set({ userData: decoded, isLogin: true });
  },

  // 토큰 제거 및 userData 초기화
  logoutAuth: () => {
    localStorage.removeItem('accessToken');
    set({ userData: {}, isLogin: false });
  },

  // 토큰 및 userData 초기화 함수 (App.jsx에서 호출 됨에 따라 앱 마운트가 될 때 토큰으로 userData 업데이트)
  initializeAuth: () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decoded = jwtDecode(token);
      set({ userData: decoded, isLogin: true, isInitialized: true });
    } else {
      set({ isInitialized: true });
    }
  },
}));
