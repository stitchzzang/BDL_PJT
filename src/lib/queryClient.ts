import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // 1회 재시도
      staleTime: 0, // 실시간 데이터 유지
      refetchInterval: 10000, // 10초마다 데이터 갱신
    },
  },
});
