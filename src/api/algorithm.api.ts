import { useMutation, useQuery } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { Algorithm } from '@/api/types/algorithm';
import { ApiResponse } from '@/api/types/common';

export const algorithmAPI = {
  createAlgorithm: (memberId: string, algorithm: Algorithm) =>
    _ky.post(`algorithm/${memberId}`, { json: algorithm }).json<ApiResponse<Algorithm>>(),
  getAlgorithm: (memberId: string) =>
    _ky.get(`algorithm/${memberId}`).json<ApiResponse<Algorithm[]>>(),
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
