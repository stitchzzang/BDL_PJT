import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 라우트 변경 시 페이지를 상단으로 스크롤합니다.
 * 레이아웃 컴포넌트에서 사용하여 페이지 이동 시마다 스크롤을 초기화하는 용도로 활용합니다.
 *
 * 사용 예시:
 * ```tsx
 * const MainLayout = () => {
 *   useScrollTopOnRouteChange(); // 라우트 변경 시 맨 위로 스크롤
 *   return <div><Outlet /></div>;
 * };
 * ```
 */
export const useScrollTopOnRouteChange = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [pathname]);
};
