import { Outlet } from 'react-router-dom';

import { useScrollTopOnRouteChange } from '@/hooks/useScrollTopOnRouteChange';

export const AlgorithmLabLayout = () => {
  // 페이지 이동 시마다 스크롤을 상단으로 이동
  useScrollTopOnRouteChange();

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-[500px] px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
};
