import { Outlet } from 'react-router-dom';

import { NavBar } from '@/components/common/nav-bar';
import { useResetAlgorithmLabStore } from '@/store/useAlgorithmLabStore';

export const MainLayout = () => {
  // URL 변경 시 알고리즘 랩 상태 초기화
  useResetAlgorithmLabStore();

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
