// 회원 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { ApiResponse } from '@/api/types/common';
import { MemberInfo, MemberPassword } from '@/api/types/member';

export const memberApi = {
  getMemberInfo: ({ memberId }: { memberId: string }) =>
    _ky.get<ApiResponse<MemberInfo>>(`member/${memberId}`).json(),

  updateMemberInfo: ({ memberId, data }: { memberId: string; data: MemberInfo }) =>
    _ky.put<ApiResponse<MemberInfo>>(`member/${memberId}`, { json: data }).json(),

  updateMemberPassword: ({ memberId, data }: { memberId: string; data: MemberPassword }) =>
    _ky.put<ApiResponse<MemberInfo>>(`member/password/${memberId}`, { json: data }).json(),

  getAccountSummary: (memberId: string) =>
    _ky.get<ApiResponse<AccountSummaryResponse>>(`member/account/${memberId}`).json(),
};

export const useMemberInfo = ({ memberId }: { memberId: string }) => {
  return useQuery({
    queryKey: ['memberInfo', memberId],
    queryFn: () => memberApi.getMemberInfo({ memberId }).then((res) => res.result),
    refetchInterval: false,
  });
};

export const useUpdateMemberInfo = ({
  memberId,
  data,
  onSuccess,
  onError,
}: {
  memberId: string;
  data: MemberInfo;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => memberApi.updateMemberInfo({ memberId, data }),
    onSuccess: () => {
      // 프로필 정보 갱신
      queryClient.invalidateQueries({ queryKey: ['memberInfo', memberId] });
      alert('프로필이 성공적으로 업데이트되었습니다.');
      onSuccess?.();
    },
    onError: () => {
      alert('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
      onError?.();
    },
  });
};

export const useUpdateMemberPassword = ({
  memberId,
  data,
  onSuccess,
  onError,
}: {
  memberId: string;
  data: MemberPassword;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  return useMutation({
    mutationFn: () => memberApi.updateMemberPassword({ memberId, data }),
    onSuccess: () => {
      alert('비밀번호가 성공적으로 업데이트되었습니다.');
      onSuccess?.();
    },
    onError: () => {
      alert('비밀번호 업데이트에 실패했습니다. 다시 시도해주세요.');
      onError?.();
    },
  });
};

export const useGetAccountSummary = (memberId: string) => {
  return useQuery({
    queryKey: ['accountSummary'],
    queryFn: () => memberApi.getAccountSummary(memberId).then((res) => res.result),
  });
};
