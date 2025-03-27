import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUpdateMemberInfo } from '@/api/member.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';

export const EditPage = () => {
  const navigate = useNavigate();
  const { userData, updateAuth: updateUserData } = useAuthStore();
  const [tempNickname, setTempNickname] = useState(userData.nickname || '');
  const [tempProfile, setTempProfile] = useState(userData.profile || '');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 확장자 검증
    const validExtensions = ['image/jpeg', 'image/png'];
    if (!validExtensions.includes(file.type)) {
      alert('JPG 또는 PNG 파일만 업로드 가능합니다.');
      return;
    }

    setSelectedImage(file);
    // 미리보기 URL 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempProfile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const { mutate: updateMemberInfo, isPending: updatePending } = useUpdateMemberInfo({
    memberId: '1', // 추후 useAuthStore에서 가져오기
    data: {
      nickname: tempNickname,
      profileImage: tempProfile,
    },
    onSuccess: () => {
      updateUserData({ nickname: tempNickname, profile: tempProfile });
      navigate('/member');
    },
    onError: () => {
      // 에러 처리는 member.api.ts에서 처리
    },
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">프로필 수정</h1>
      <div className="flex min-w-[400px] flex-col items-center gap-5 rounded-lg border border-btn-primary-inactive-color bg-modal-background-color p-4">
        <div className="flex flex-col items-center gap-4">
          <img
            src={tempProfile || '/none-img/none_profile_img.png'}
            alt="profile"
            className="h-32 w-32 rounded-full"
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png"
            onChange={handleImageChange}
          />
          <Button className="w-full" variant="black" onClick={() => fileInputRef.current?.click()}>
            이미지 변경
          </Button>
        </div>
        <div className="flex w-full flex-col items-center gap-2">
          <Input
            type="text"
            className="h-14"
            placeholder="이름"
            value={tempNickname}
            onChange={(e) => setTempNickname(e.target.value)}
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
