// 인증 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { _ky, _kyAuth } from '@/api/instance';
import { ApiResponse } from '@/api/types/common';
import { useAuthStore } from '@/store/useAuthStore';

interface LoginResult {
  nickname: string;
  profile: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    _ky
      .post('member/login', {
        json: { email, password },
      })
      .json<ApiResponse<LoginResult>>(),

  logout: () => _kyAuth.post('member/logout', {}).json<ApiResponse<void>>(),
  signout: () => _kyAuth.patch('member/register', {}).json<ApiResponse<void>>(),
};

export const useLogin = () => {
  const loginAuth = useAuthStore((state) => state.loginAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password).then((res) => res.result),
    onSuccess: (result) => {
      // 쿠키에서 accessToken 추출
      const accessToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('Authorization='))
        ?.split('=')[1];

      // accessToken이 있으면 로그인 처리
      if (accessToken) {
        loginAuth(accessToken, { nickname: result.nickname, profile: result.profile });
        navigate('/signup/success');
      }
    },
    // 로그인 실패
    onError: () => {
      alert('로그인 실패');
    },
  });
};

export const useLogout = () => {
  const logoutAuth = useAuthStore((state) => state.logoutAuth);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logoutAuth();
    },
    onError: () => {
      alert('로그아웃 실패');
    },
  });
};

export const useSignout = () => {
  const logoutAuth = useAuthStore((state) => state.logoutAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.signout(),
    onSuccess: () => {
      logoutAuth();
      alert('회원탈퇴 성공');
      navigate('/');
    },
    onError: () => {
      alert('회원탈퇴 실패');
    },
  });
};
