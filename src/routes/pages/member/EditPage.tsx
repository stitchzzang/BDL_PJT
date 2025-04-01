import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useSignout } from '@/api/auth.api';
import { useUpdateMemberInfo } from '@/api/member.api';
import { MemberInfo } from '@/api/types/member';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { getResizeImage } from '@/utils/getResizeImage';

// 프로필 수정 폼 유효성 검사를 위한 스키마 정의
const editProfileSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 최소 2자 이상이어야 합니다.')
    .max(5, '닉네임은 최대 5자까지 가능합니다.'),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export const EditPage = () => {
  const navigate = useNavigate();
  const { userData, updateAuth: updateUserData } = useAuthStore();
  const [tempProfile, setTempProfile] = useState(userData.profile || '');
  const [originalTempProfile, setOriginalTempProfile] = useState(userData.profile || '');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useDefaultProfile, setUseDefaultProfile] = useState(false);
  const [profileChanged, setProfileChanged] = useState(false);

  // form 관련 설정
  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      nickname: userData.nickname || '',
    },
    mode: 'onChange',
  });

  // 폼 필드의 유효성 검사 결과
  const {
    formState: { isValid, errors, dirtyFields },
  } = form;

  // 닉네임이 변경되었는지 확인
  const nicknameChanged = dirtyFields.nickname;

  // 처음 로드 시 모든 필드 검증 실행
  useEffect(() => {
    form.trigger();
  }, [form]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 확장자 검증
    const validExtensions = ['image/jpeg', 'image/png'];
    if (!validExtensions.includes(file.type)) {
      alert('JPG 또는 PNG 파일만 업로드 가능합니다.');
      return;
    }

    try {
      // 이미지 리사이즈
      const resizedFile = await getResizeImage(file, 400, 400);
      setSelectedImage(resizedFile);

      // 미리보기 URL 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setTempProfile(result);
        setOriginalTempProfile(result);
        setProfileChanged(true);
      };
      reader.readAsDataURL(resizedFile);

      // 기본 프로필 사용 해제
      setUseDefaultProfile(false);
    } catch (error) {
      alert('이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const buildUpdateData = (): MemberInfo => {
    const updateData: MemberInfo = {};
    const formValues = form.getValues();

    if (nicknameChanged) {
      updateData.nickname = formValues.nickname;
    }

    if (profileChanged || useDefaultProfile) {
      updateData.profileImage = useDefaultProfile ? '' : tempProfile;
      updateData.deleteProfile = useDefaultProfile;
    }
    return updateData;
  };

  const { mutate: updateMemberInfo } = useUpdateMemberInfo({
    memberId: userData.memberId?.toString() || '',
    data: buildUpdateData,
    navigateTo: () => navigate('/member'),
    updateUserState: (data) => {
      const updatedData: { nickname?: string; profile?: string | null } = {};

      if (data.nickname) {
        updatedData.nickname = data.nickname;
      }

      if (data.profileImage !== undefined || data.deleteProfile) {
        updatedData.profile = data.deleteProfile ? null : data.profileImage || null;
      }

      updateUserData(updatedData);
    },
  });

  const handleSwitchChange = (checked: boolean) => {
    setUseDefaultProfile(checked);
    setProfileChanged(true);

    if (checked) {
      setTempProfile('');
    } else {
      // 체크 해제시 원래 선택했던 이미지로 복원
      setTempProfile(originalTempProfile);
    }
  };

  const { mutate: signout } = useSignout();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">프로필 수정</h1>
      <div className="flex min-w-[400px] flex-col items-center gap-5 rounded-lg border border-btn-primary-inactive-color bg-modal-background-color p-4">
        <Form {...form}>
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-32 w-32 overflow-hidden rounded-full">
              <img
                src={
                  useDefaultProfile
                    ? '/none-img/none_profile_img.png'
                    : tempProfile || '/none-img/none_profile_img.png'
                }
                alt="profile"
                className="h-full w-full object-cover"
              />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
            />
            <div className="flex items-center justify-center gap-2">
              <Switch checked={useDefaultProfile} onCheckedChange={handleSwitchChange} />
              <p className="text-text-border-color text-sm">기본 프로필 사용</p>
            </div>
            <Button
              className="w-full"
              variant="black"
              onClick={() => fileInputRef.current?.click()}
              disabled={useDefaultProfile}
            >
              이미지 변경
            </Button>
          </div>
          <div className="flex w-full flex-col items-center gap-2">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => {
                const isValid = !errors.nickname && dirtyFields.nickname;
                const hasError = !!errors.nickname && dirtyFields.nickname;
                return (
                  <FormItem className="w-full">
                    <div className="relative">
                      <FormControl>
                        <Input type="text" className="h-14 pr-10" placeholder="이름" {...field} />
                      </FormControl>
                      {isValid && (
                        <CheckCircleIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-btn-green-color" />
                      )}
                      {hasError && (
                        <XCircleIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-btn-red-color" />
                      )}
                    </div>
                    <p
                      className={cn(
                        'text-sm',
                        hasError ? 'text-btn-red-color' : 'text-text-inactive-2-color',
                      )}
                    >
                      {hasError ? errors.nickname?.message : '변경할 닉네임을 입력해주세요.'}
                    </p>
                  </FormItem>
                );
              }}
            />
          </div>
          <div className="flex w-full flex-col gap-4">
            <Button
              variant="gray"
              className="w-full"
              onClick={() => navigate('/member/edit/password')}
            >
              비밀번호 변경
            </Button>
            <Button
              variant="blue"
              className="w-full"
              onClick={() => updateMemberInfo()}
              disabled={
                (!nicknameChanged && !profileChanged) || !form.getValues().nickname || !isValid
              }
            >
              프로필 수정
            </Button>
            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="red" className="w-full">
                  회원탈퇴
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>회원 탈퇴</AlertDialogTitle>
                  <AlertDialogDescription>
                    정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction variant="red" onClick={() => signout()}>
                    탈퇴하기
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Form>
      </div>
    </div>
  );
};
