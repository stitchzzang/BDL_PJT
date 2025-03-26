// 인증 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)

import { useMutation } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { ApiResponse } from '@/api/types/common';

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
};

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password).then((res) => res.result),
  });
};
