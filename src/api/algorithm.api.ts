// 알고리즘 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { _kyAuth } from '@/api/instance';
import { Algorithm, AlgorithmResponse, CreateAlgorithmRequest } from '@/api/types/algorithm';
import { ApiResponse } from '@/api/types/common';

export const algorithmAPI = {
  createAlgorithm: (memberId: string, algorithm: CreateAlgorithmRequest) =>
    _kyAuth.post(`algorithm/${memberId}`, { json: algorithm }).json<ApiResponse<Algorithm>>(),
  getAlgorithm: (memberId: string) =>
    _kyAuth.get(`algorithm/${memberId}`).json<ApiResponse<AlgorithmResponse>>(),
  deleteAlgorithm: (memberId: string, algorithmId: string) =>
    _kyAuth.delete(`algorithm/${memberId}/${algorithmId}`).json<ApiResponse<void>>(),
};

export const useCreateAlgorithm = () => {
  return useMutation({
    mutationFn: ({
      memberId,
      algorithm,
    }: {
      memberId: string;
      algorithm: CreateAlgorithmRequest;
    }) => algorithmAPI.createAlgorithm(memberId, algorithm).then((res) => res.result),
  });
};

export const useGetAlgorithm = (memberId: string) => {
  return useQuery<Algorithm[]>({
    queryKey: ['algorithms'],
    queryFn: () => algorithmAPI.getAlgorithm(memberId).then((res) => res.result.algorithms),
  });
};

export const useDeleteAlgorithm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, algorithmId }: { memberId: string; algorithmId: string }) =>
      algorithmAPI.deleteAlgorithm(memberId, algorithmId).then((res) => res.result),
    onSuccess: () => {
      // 삭제 후 알고리즘 목록 쿼리 무효화하여 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ['algorithms'] });
    },
  });
};
