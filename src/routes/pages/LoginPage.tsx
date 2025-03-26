import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLogin } from '@/api/auth.api';
import { MainLogoIcon } from '@/components/common/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutateAsync: login, isPending } = useLogin();
  const loginAuth = useAuthStore((state) => state.loginAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 로그인 요청
      const result = await login({ email, password });
      // 쿠키에서 accessToken 추출
      const accessToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('Authorization='))
        ?.split('=')[1];
      // accessToken이 있으면 로그인 성공
      if (accessToken) {
        // 로그인 정보 저장
        loginAuth(accessToken, { nickname: result.nickname, profile: result.profile });
        // 회원가입 성공 페이지로 이동
        navigate('/signup/success');
      }
    } catch (error) {
      // 로그인 실패
      alert('로그인 실패');
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <MainLogoIcon color="white" className="h-36 w-36" />
      <div className="w-full max-w-96 rounded-lg bg-modal-background-color p-6 shadow-lg">
        <form onSubmit={handleLogin} className="flex flex-col items-center justify-center gap-3">
          <Input
            placeholder="이메일"
            className="h-12"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            placeholder="비밀번호"
            className="h-12"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button variant="blue" className="mt-5 w-full" type="submit" disabled={isPending}>
            {isPending ? '로그인 중...' : '로그인'}
          </Button>
          <div className="flex w-full flex-row items-end justify-end gap-5">
            <button type="button" className="text-base text-border-color hover:text-primary-color">
              비밀번호 찾기
            </button>
            <button
              type="button"
              className="text-base text-border-color hover:text-primary-color"
              onClick={() => navigate('/signup')}
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
      <p className="mt-5 text-center text-sm text-border-color">
        © 2025 B.LAB. All rights reserved.
      </p>
    </div>
  );
};
