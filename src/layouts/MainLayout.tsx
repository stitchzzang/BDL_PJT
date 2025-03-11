import { Outlet } from 'react-router-dom';

import { NavBar } from '@/components/common/nav-bar';

export const MainLayout = () => {
  return (
    <div className="flex flex-col">
      <NavBar />
      <Outlet />
    </div>
  );
};
