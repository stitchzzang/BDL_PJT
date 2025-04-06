import { create } from 'zustand';

interface UserData {
  memberId: number | null;
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
  return storedData
    ? JSON.parse(storedData)
    : { memberId: null, nickname: null, profile: null, isLogin: false };
};

// 토큰 만료 시간 확인 함수
const isTokenExpired = (): boolean => {
  const expiryTime = localStorage.getItem('tokenExpiry');
  if (!expiryTime) return true;
  return new Date().getTime() > parseInt(expiryTime, 10);
};

// 토큰 저장 함수 (10시간 유효기간 설정)
const saveTokenWithExpiry = (token: string): void => {
  // 현재 시간에서 10시간을 더한 타임스탬프 계산 (밀리초 단위)
  const expiryTime = new Date().getTime() + 10 * 60 * 60 * 1000; // 10시간
  localStorage.setItem('accessToken', token);
  localStorage.setItem('tokenExpiry', expiryTime.toString());
};

export const useAuthStore = create<AuthState>((set) => ({
  userData: getUserDataFromStorage(),
  isLogin: getUserDataFromStorage().nickname !== null,
  isInitialized: false,

  loginAuth: (token: string, userData: UserData) => {
    saveTokenWithExpiry(token);
    localStorage.setItem('userData', JSON.stringify(userData));
    set({ userData, isLogin: true });
  },

  logoutAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userData');
    set({ userData: { memberId: null, nickname: null, profile: null }, isLogin: false });
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

    // 토큰이 있지만 만료된 경우 로그아웃 처리
    if (token && isTokenExpired()) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('userData');
      set({
        isInitialized: true,
        isLogin: false,
        userData: { memberId: null, nickname: null, profile: null },
      });
      return;
    }

    if (token) {
      set({ isLogin: true, isInitialized: true, userData });
    } else {
      set({ isInitialized: true, userData });
    }
  },
}));
