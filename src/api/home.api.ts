// 홈 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)

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
