import { useEffect } from 'react';

import { useAuthStore } from '@/store/useAuthStore';

export function useAuthInitialize() {
  // 애플리케이션이 처음 시작될 때(새로고침 포함)
  // localStorage 에 저장된 토큰을 조회하여 로그인 상태를 초기화(userData 복원)
  // 사용자가 로그인 후 브라우저를 닫았다가 다시 열어도 토큰이 유효하다면 자동으로 로그인 상태 유지
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    useAuthStore.getState().initializeAuth(); // 앱 시작 시 토큰 조회 후 로그인 상태 초기화
  }, []);

  return isInitialized;
}
