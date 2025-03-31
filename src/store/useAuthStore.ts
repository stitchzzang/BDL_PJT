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

const getUserDataFromStorage = (): UserData => {
  const storedData = localStorage.getItem('userData');
  return storedData ? JSON.parse(storedData) : { nickname: null, profile: null };
};

export const useAuthStore = create<AuthState>((set) => ({
  userData: getUserDataFromStorage(),
  isLogin: getUserDataFromStorage().nickname !== null,
  isInitialized: false,

  loginAuth: (token: string, userData: UserData) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    set({ userData, isLogin: true });
  },

  logoutAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    set({ userData: { nickname: null, profile: null }, isLogin: false });
  },

  updateAuth: (newUserData: Partial<UserData>) => {
    set((state) => {
      const updatedUserData = { ...state.userData, ...newUserData };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      return { userData: updatedUserData };
    });
  },

  // 토큰 및 userData 초기화 함수 (App.jsx에서 호출 됨에 따라 앱 마운트가 될 때 토큰으로 userData 업데이트)
  initializeAuth: () => {
    const token = localStorage.getItem('accessToken');
    const userData = getUserDataFromStorage();
    if (token) {
      set({ isLogin: true, isInitialized: true, userData });
    } else {
      set({ isInitialized: true, userData });
    }
  },
}));
