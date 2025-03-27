import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';

import { type MemberInfo } from '@/api/types/member';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProfileProps {
  memberInfo?: MemberInfo;
  isLoading?: boolean;
  isError?: boolean;
}

export const Profile = ({ memberInfo, isLoading, isError }: ProfileProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2">
        <img
          src="/none-img/none_profile_img.png"
          alt="profile"
          className="h-10 w-10 rounded-full"
        />
        <p className="text-2xl font-medium text-btn-red-color">프로필을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={memberInfo?.profileImage || '/none-img/none_profile_img.png'}
        alt="profile"
        className="h-10 w-10 rounded-full"
      />
      <p className="text-2xl font-medium">{memberInfo?.nickname || '현재 닉네임이 없습니다.'}</p>
      <NavLink
        to="/member/edit"
        className={({ isActive }) =>
          `flex items-center gap-1 rounded-lg px-4 py-2 text-text-inactive-3-color transition-colors ${
            isActive
              ? 'bg-modal-background-color text-text-main-color'
              : 'hover:bg-modal-background-color hover:text-text-main-color'
          }`
        }
      >
        <Cog6ToothIcon className="h-5 w-5" />
        <p className="text-sm">프로필 수정</p>
      </NavLink>
    </div>
  );
};
