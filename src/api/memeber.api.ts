// 회원 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)

import { useQuery } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { ApiResponse } from '@/api/types/common';
import { MemberInfo } from '@/api/types/member';

export const memberApi = {
  getMemberInfo: () => _ky.get<ApiResponse<MemberInfo>>('/api/member/{memberId}').json(),
};

export const useMemberInfo = () => {
  return useQuery({
    queryKey: ['memberInfo'],
    queryFn: () => memberApi.getMemberInfo().then((res) => res.result),
  });
};
