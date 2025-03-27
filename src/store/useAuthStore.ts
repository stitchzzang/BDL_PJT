import { create } from 'zustand';

interface UserData {
  nickname: string | null;
  profile: string | null;
}

interface AuthState {
  userData: UserData;
  isLogin: boolean;
  isInitialized: boolean;
  loginAuth: (token: string, userData: UserData) => void;
  logoutAuth: () => void;
  initializeAuth: () => void;
  updateAuth: (userData: Partial<UserData>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userData: { nickname: null, profile: null },
  isLogin: false,
  isInitialized: false,

  loginAuth: (token: string, userData: UserData) => {
    localStorage.setItem('accessToken', token);
    set({ userData, isLogin: true });
  },

  logoutAuth: () => {
    localStorage.removeItem('accessToken');
    set({ userData: { nickname: null, profile: null }, isLogin: false });
  },

  updateAuth: (newUserData: Partial<UserData>) => {
    set((state) => ({
      userData: { ...state.userData, ...newUserData },
    }));
  },

  // 토큰 및 userData 초기화 함수 (App.jsx에서 호출 됨에 따라 앱 마운트가 될 때 토큰으로 userData 업데이트)
  initializeAuth: () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      set({ isLogin: true, isInitialized: true });
    } else {
      set({ isInitialized: true });
    }
  },
}));
