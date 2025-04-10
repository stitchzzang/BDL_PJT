import { Outlet } from 'react-router-dom';

import { Footer } from '@/components/common/footer';
import { NavBar } from '@/components/common/nav-bar';
import { useScrollTopOnRouteChange } from '@/hooks/useScrollTopOnRouteChange';
import { useResetAlgorithmLabStore } from '@/store/useAlgorithmLabStore';

export const MainLayout = () => {
  // URL 변경 시 알고리즘 랩 상태 초기화
  useResetAlgorithmLabStore();
  // 페이지 이동 시마다 스크롤을 상단으로 이동
  useScrollTopOnRouteChange();

  return (
    <div className="flex min-h-screen min-w-[1024px] flex-col overflow-x-auto">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
