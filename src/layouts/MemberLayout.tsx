import { Outlet } from 'react-router-dom';

import { useMemberInfo } from '@/api/member.api';
import { Profile } from '@/components/member-info/profile';
import { SectionNavBar } from '@/components/member-info/section-nav-bar';

export const MemberLayout = () => {
  const { data: memberInfo, isLoading, isError } = useMemberInfo({ memberId: '1' });

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <Profile memberInfo={memberInfo} isLoading={isLoading} isError={isError} />
        <SectionNavBar />
      </div>
      <hr className="mb-12 mt-3 border-t border-btn-primary-inactive-color" />
      <Outlet />
    </>
  );
};
