// 회원 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HTTPError } from 'ky';
import { toast } from 'react-hot-toast';

import { _ky } from '@/api/instance';
import { handleKyError } from '@/api/instance/errorHandler';
import { ApiResponse } from '@/api/types/common';
import { AccountSummaryResponse, MemberInfo, MemberPassword } from '@/api/types/member';
export const memberApi = {
  getMemberInfo: (memberId: string) =>
    _ky.get<ApiResponse<MemberInfo>>(`member/${memberId}`).json(),

  updateMemberInfo: (
    memberId: string,
    data: { nickname?: string; profileImage?: File | null; deleteProfile?: boolean },
  ) => {
    const formData = new FormData();

    if (data.nickname) {
      formData.append('nickname', data.nickname);
    }

    if (data.profileImage) {
      formData.append('profileImage', data.profileImage);
    }

    if (data.deleteProfile !== undefined) {
      formData.append('deleteProfile', data.deleteProfile ? '1' : '0');
    }

    return _ky
      .patch<ApiResponse<MemberInfo>>(`member/${memberId}`, {
        body: formData,
      })
      .json();
  },

  updateMemberPassword: (memberId: string, data: MemberPassword) =>
    _ky.post<ApiResponse<MemberInfo>>(`member/password/${memberId}`, { json: data }).json(),

  getAccountSummary: (memberId: string) =>
    _ky.get<ApiResponse<AccountSummaryResponse>>(`member/account/${memberId}`).json(),

  resetAccount: (memberId: string) =>
    _ky.delete<ApiResponse<AccountSummaryResponse>>(`member/${memberId}/account/reset`).json(),
};

export const useMemberInfo = (memberId: string) => {
  return useQuery({
    queryKey: ['memberInfo', memberId],
    queryFn: () => memberApi.getMemberInfo(memberId).then((res) => res.result),
    refetchInterval: false,
  });
};

export const useUpdateMemberInfo = ({
  memberId,
  data,
  onSuccess,
  onError,
  navigateTo,
  updateUserState,
}: {
  memberId: string;
  data:
    | { nickname?: string; profileImage?: File | null; deleteProfile?: boolean }
    | (() => { nickname?: string; profileImage?: File | null; deleteProfile?: boolean });
  onSuccess?: () => void;
  onError?: () => void;
  navigateTo?: () => void;
  updateUserState?: (data: { nickname?: string; profile?: string | null }) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const dataToSend = typeof data === 'function' ? data() : data;
      return memberApi.updateMemberInfo(memberId, dataToSend);
    },
    onSuccess: (response) => {
      // 프로필 정보 갱신
      queryClient.invalidateQueries({ queryKey: ['memberInfo', memberId] });
      toast.success('프로필이 성공적으로 업데이트되었습니다.');
      // 사용자 상태 업데이트 (필요한 경우)
      if (updateUserState) {
        const updatedData = response.result || {};
        const updateData = {
          nickname: updatedData.nickname,
          profile: updatedData.profileUrl,
        };

        updateUserState(updateData);
      }

      // 페이지 이동 (필요한 경우)
      if (navigateTo) {
        navigateTo();
      }

      // 추가 콜백 실행
      onSuccess?.();
    },
    onError: (error: HTTPError) => {
      handleKyError(error, '프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
      onError?.();
    },
  });
};

export const useUpdateMemberPassword = ({
  memberId,
  data,
  onSuccess,
  onError,
  navigateTo,
}: {
  memberId: string;
  data: MemberPassword;
  onSuccess?: () => void;
  onError?: () => void;
  navigateTo?: () => void;
}) => {
  return useMutation({
    mutationFn: () => memberApi.updateMemberPassword(memberId, data),
    onSuccess: () => {
      toast.success('비밀번호가 성공적으로 업데이트되었습니다.');
      if (navigateTo) {
        navigateTo();
      }
      onSuccess?.();
    },
    onError: (error: HTTPError) => {
      handleKyError(error, '비밀번호 업데이트에 실패했습니다. 다시 시도해주세요.');
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

export const useResetAccount = (memberId: string, onSuccess?: () => void, onError?: () => void) => {
  return useMutation({
    mutationFn: () => memberApi.resetAccount(memberId),
    onSuccess: () => {
      toast.success('계좌가 성공적으로 초기화되었습니다.');
      onSuccess?.();
    },
    onError: (error: HTTPError) => {
      handleKyError(error, '계좌 초기화에 실패했습니다. 다시 시도해주세요.');
      onError?.();
    },
  });
};
