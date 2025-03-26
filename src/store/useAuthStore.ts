import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';

interface UserData {
  id: number | null;
  email: string | null;
  nickname: string | null;
  profile: string | null;
}

interface AuthState {
  userData: UserData;
  isLogin: boolean;
  isInitialized: boolean;
  loginAuth: (token: string) => void;
  logoutAuth: () => void;
  initializeAuth: () => void;
}

type JWTPayload = UserData;

export const useAuthStore = create<AuthState>((set) => ({
  // userData만 전역 상태 관리
  userData: { id: null, email: null, nickname: null, profile: null }, // const {id, email, nickname} = useAuthStore((state) => state.userData) 형식으로 사용
  isLogin: false,
  isInitialized: false,

  // 토큰 저장 및 userData 업데이트
  loginAuth: (token: string) => {
    const decoded = jwtDecode<JWTPayload>(token);
    localStorage.setItem('accessToken', token);
    set({ userData: decoded, isLogin: true });
  },

  // 토큰 제거 및 userData 초기화
  logoutAuth: () => {
    localStorage.removeItem('accessToken');
    set({ userData: { id: null, email: null, nickname: null, profile: null }, isLogin: false });
  },

  // 토큰 및 userData 초기화 함수 (App.jsx에서 호출 됨에 따라 앱 마운트가 될 때 토큰으로 userData 업데이트)
  initializeAuth: () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decoded = jwtDecode<JWTPayload>(token);
      set({ userData: decoded, isLogin: true, isInitialized: true });
    } else {
      set({ isInitialized: true });
    }
  },
}));
