import { Profile } from '@/components/member-info/profile';
import { SectionNavBar } from '@/components/member-info/section-nav-bar';

export const MemberLayout = () => {
  return (
    <div className="flex flex-col gap-4">
      <Profile />
      <SectionNavBar />
      <hr className="border-t border-btn-primary-inactive-color" />
    </div>
  );
};
