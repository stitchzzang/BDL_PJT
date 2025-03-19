import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-2">
      <img src="https://placehold.co/80x80" alt="profile" className="h-10 w-10 rounded-full" />
      <p className="text-2xl font-medium">홍길동</p>
      <button
        className="flex items-center gap-1 rounded-lg px-4 py-2 text-text-inactive-3-color hover:bg-modal-background-color hover:text-text-main-color active:bg-modal-background-color active:text-text-main-color"
        onClick={() => navigate('/member/edit')}
      >
        <Cog6ToothIcon className="h-5 w-5" />
        <p className="text-sm">프로필 수정</p>
      </button>
    </div>
  );
};
