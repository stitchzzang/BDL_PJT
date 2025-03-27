import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUpdateMemberInfo } from '@/api/member.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export const EditPage = () => {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState(''); // 추후 useAuthStore에서 가져오기
  const [profileImage, setProfileImage] = useState(''); // 추후 useAuthStore에서 가져오기

  const { mutate: updateMemberInfo, isPending: updatePending } = useUpdateMemberInfo({
    memberId: '1', // 추후 useAuthStore에서 가져오기
    data: {
      nickname,
      profileImage,
    },
  });
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">프로필 수정</h1>
      <div className="flex min-w-[400px] flex-col items-center gap-5 rounded-lg border border-btn-primary-inactive-color bg-modal-background-color p-4">
        <div className="flex flex-col items-center gap-4">
          <img
            src={profileImage || '/none-img/none_profile_img.png'}
            alt="profile"
            className="h-32 w-32 rounded-full"
          />
          <Button className="w-full" variant="black">
            이미지 변경
          </Button>
        </div>
        <div className="flex w-full flex-col items-center gap-2">
          <Input
            type="text"
            className="h-14"
            placeholder="이름"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <p className="text-sm text-text-inactive-2-color">변경할 닉네임을 입력해주세요.</p>
        </div>
        <div className="flex w-full flex-col gap-4">
          <Button
            variant="gray"
            className="w-full"
            onClick={() => navigate('/member/edit/password')}
          >
            비밀번호 변경
          </Button>
          <Button variant="blue" className="w-full" onClick={() => updateMemberInfo()}>
            프로필 수정
          </Button>
        </div>
      </div>
    </div>
  );
};
