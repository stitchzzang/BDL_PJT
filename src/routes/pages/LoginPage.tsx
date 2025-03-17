import { MainLogoIcon } from '@/components/common/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const LoginPage = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <MainLogoIcon color="white" className="h-36 w-36" />
      <div className="w-full max-w-96 rounded-lg bg-modal-background-color p-6 shadow-lg">
        <div className="flex flex-col items-center justify-center gap-3">
          <Input placeholder="이메일" className="h-12" />
          <Input placeholder="비밀번호" className="h-12" />
          <Button variant="blue" className="mt-5 w-full">
            로그인
          </Button>
          <div className="flex w-full flex-row items-end justify-end gap-5">
            <button className="text-base text-border-color hover:text-primary-color">
              비밀번호 찾기
            </button>
            <button className="text-base text-border-color hover:text-primary-color">
              회원가입
            </button>
          </div>
        </div>
      </div>
      <p className="mt-5 text-center text-sm text-border-color">
        © 2025 B.LAB. All rights reserved.
      </p>
    </div>
  );
};
