import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useLogin } from '@/api/auth.api';
import { MainLogoIcon } from '@/components/common/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';

export const LoginPage = () => {
  const { isLogin } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const initialRender = useRef(true);
  const { mutateAsync: login, isPending } = useLogin();

  useEffect(() => {
    // 페이지 로드 시 저장된 에러 메시지 확인
    const savedError = localStorage.getItem('loginError');
    if (savedError) {
      setError(savedError);
      localStorage.removeItem('loginError'); // 메시지 표시 후 삭제
    }

    if (isLogin && initialRender.current) {
      toast.success('이미 로그인 상태입니다.');
      navigate('/');
    }
    initialRender.current = false;
  }, [isLogin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
    } catch (error) {
      localStorage.setItem('loginError', '아이디 또는 비밀번호가 잘못 되었습니다.');
      window.location.reload();
    }
  };

  if (isLogin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <MainLogoIcon color="white" className="h-36 w-36" />
      <div className="w-full max-w-96 rounded-lg bg-modal-background-color p-6 shadow-lg">
        <form onSubmit={handleLogin} className="flex flex-col items-center justify-center gap-3">
          <Input
            placeholder="아이디"
            className="h-12"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={20}
          />
          <Input
            placeholder="비밀번호"
            className="h-12"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            maxLength={20}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button variant="blue" className="mt-5 w-full" type="submit" disabled={isPending}>
            {isPending ? '로그인 중...' : '로그인'}
          </Button>
          <div className="mt-3 flex w-full flex-row items-center justify-end gap-2">
            <p className="text-sm text-border-color">BDL이 처음이신가요?</p>
            <button
              type="button"
              className="text-base font-semibold text-primary-color hover:text-primary-color/80"
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
