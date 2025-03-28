// 알고리즘 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)
import { useMutation, useQuery } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { Algorithm } from '@/api/types/algorithm';
import { ApiResponse } from '@/api/types/common';

export const algorithmAPI = {
  createAlgorithm: (memberId: string, algorithm: Algorithm) =>
    _ky.post(`algorithm/${memberId}`, { json: algorithm }).json<ApiResponse<Algorithm>>(),
  getAlgorithm: (memberId: string) =>
    _ky.get(`algorithm/${memberId}`).json<ApiResponse<Algorithm[]>>(),
  deleteAlgorithm: (memberId: string, algorithmId: string) =>
    _ky.delete(`algorithm/${memberId}/${algorithmId}`).json<ApiResponse<void>>(),
};

export const useCreateAlgorithm = () => {
  return useMutation({
    mutationFn: ({ memberId, algorithm }: { memberId: string; algorithm: Algorithm }) =>
      algorithmAPI.createAlgorithm(memberId, algorithm).then((res) => res.result),
  });
};

export const useGetAlgorithm = (memberId: string) => {
  return useQuery<Algorithm[]>({
    queryKey: ['algorithms'],
    queryFn: () => algorithmAPI.getAlgorithm(memberId).then((res) => res.result),
  });
};

export const useDeleteAlgorithm = () => {
  return useMutation({
    mutationFn: ({ memberId, algorithmId }: { memberId: string; algorithmId: string }) =>
      algorithmAPI.deleteAlgorithm(memberId, algorithmId).then((res) => res.result),
  });
};
