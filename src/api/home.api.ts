import { useQuery } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { ApiResponse } from '@/api/types/common';
import { LatestNews } from '@/api/types/home';

export const homeApi = {
  getLatestNews: () => _ky.get('news/latest').json<ApiResponse<LatestNews[]>>(),
};

export const useLatestNews = () => {
  return useQuery({
    queryKey: ['latestNews'],
    queryFn: () => homeApi.getLatestNews().then((res) => res.result),
  });
};
