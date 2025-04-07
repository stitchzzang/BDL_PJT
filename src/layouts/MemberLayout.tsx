import { Navigate, Outlet } from 'react-router-dom';

import { Profile } from '@/components/member-info/profile';
import { SectionNavBar } from '@/components/member-info/section-nav-bar';
import { useScrollTopOnRouteChange } from '@/hooks/useScrollTopOnRouteChange';
import { useAuthStore } from '@/store/useAuthStore';

export const MemberLayout = () => {
  // 페이지 이동 시마다 스크롤을 상단으로 이동
  useScrollTopOnRouteChange();
  const { isLogin } = useAuthStore();

  // 로그인되지 않은 상태에서는 로그인 페이지로 리디렉션
  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <div className="flex animate-fadeIn flex-col items-center gap-4">
        <Profile />
        <SectionNavBar />
      </div>
      <hr className="mb-12 mt-3 border-t border-btn-primary-inactive-color" />
      <div className="flex animate-fadeIn flex-col items-center gap-4">
        <Outlet />
      </div>
    </>
  );
};
