// 인증 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)

import { useMutation } from '@tanstack/react-query';
import { HTTPError } from 'ky';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { _ky, _kyAuth } from '@/api/instance';
import { handleKyError } from '@/api/instance/errorHandler';
import { LoginResponse, SignupRequest } from '@/api/types/auth';
import { ApiResponse } from '@/api/types/common';
import {
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from '@/services/notificationService';
import { useAuthStore } from '@/store/useAuthStore';

export const authApi = {
  login: (email: string, password: string) =>
    _ky
      .post('auth/login', {
        json: { email, password },
      })
      .json<ApiResponse<LoginResponse>>(),

  logout: () => _kyAuth.post('auth/logout', {}).json<ApiResponse<void>>(),
  signup: (data: SignupRequest) =>
    _ky
      .post('auth/signup', {
        json: data,
      })
      .json<ApiResponse<void>>(),
  signout: (memberId: string) => _kyAuth.delete(`member/${memberId}`, {}).json<ApiResponse<void>>(),
};

export const useLogin = () => {
  const loginAuth = useAuthStore((state) => state.loginAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await _ky.post('auth/login', {
        json: { email, password },
      });
      const data = await response.json<ApiResponse<LoginResponse>>();
      return {
        ...data.result,
        headers: response.headers,
      };
    },
    onSuccess: (result) => {
      // 응답 헤더에서 accessToken 추출
      const BEARER_PREFIX = 'Bearer ';
      const accessToken = result.headers.get('Authorization')?.substring(BEARER_PREFIX.length);

      // accessToken이 있으면 로그인 처리
      if (accessToken) {
        loginAuth(accessToken, {
          memberId: result.memberId,
          nickname: result.nickname,
          profile: result.profile,
        });
        subscribeToNotifications(); // SSE 연결 시작
        toast.success('로그인되었습니다.');
        navigate('/');
      }
    },
    // 로그인 실패
    onError: () => {
      throw new Error('로그인 실패');
    },
  });
};

export const useLogout = () => {
  const logoutAuth = useAuthStore((state) => state.logoutAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      unsubscribeFromNotifications(); // SSE 연결 종료
      logoutAuth();
      toast.success('로그아웃되었습니다.');
      navigate('/');
    },
    onError: (error: HTTPError) => {
      // 사용자가 의도적으로 로그아웃한 경우에는 토큰 오류여도 성공적으로 처리
      unsubscribeFromNotifications(); // SSE 연결 종료
      logoutAuth();
      toast.success('로그아웃되었습니다.');
      navigate('/');
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
    onSuccess: () => {
      toast.success('회원가입이 완료되었습니다.');
    },
    onError: (error: HTTPError) => {
      handleKyError(error, '회원가입에 실패했습니다.');
    },
  });
};

export const useSignout = () => {
  const logoutAuth = useAuthStore((state) => state.logoutAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (memberId: string) => authApi.signout(memberId),
    onSuccess: () => {
      logoutAuth();
      toast.success('회원탈퇴가 완료되었습니다.');
      navigate('/');
    },
    onError: (error: HTTPError) => {
      handleKyError(error, '회원탈퇴에 실패했습니다.');
    },
  });
};
