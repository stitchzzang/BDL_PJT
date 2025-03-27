import { Outlet } from 'react-router-dom';

import { Profile } from '@/components/member-info/profile';
import { SectionNavBar } from '@/components/member-info/section-nav-bar';

export const MemberLayout = () => {
  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <Profile />
        <SectionNavBar />
      </div>
      <hr className="mb-12 mt-3 border-t border-btn-primary-inactive-color" />
      <Outlet />
    </>
  );
};
