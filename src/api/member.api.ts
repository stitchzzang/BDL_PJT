// 회원 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)

import { useQuery } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { ApiResponse } from '@/api/types/common';
import { MemberInfo } from '@/api/types/member';

export const memberApi = {
  getMemberInfo: ({ memberId }: { memberId: string }) =>
    _ky.get<ApiResponse<MemberInfo>>(`member/${memberId}`).json(),
};

export const useMemberInfo = ({ memberId }: { memberId: string }) => {
  return useQuery({
    queryKey: ['memberInfo', memberId],
    queryFn: () => memberApi.getMemberInfo({ memberId }).then((res) => res.result),
    refetchInterval: false,
  });
};
