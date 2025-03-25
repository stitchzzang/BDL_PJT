import { useQuery } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { ApiResponse } from '@/api/types/common';
import { StockMinuteData } from '@/api/types/stock';

export const StockApi = {
  // 분봉 데이터 가져오기 (limit 값은 직접 입력)
  getStockMinuteData: (limit: number) =>
    _ky.get(`stocks/000660/minute/initial?limit=${limit}`).json<ApiResponse<StockMinuteData[]>>(),
};

export const useStockMinuteData = () => {
  return useQuery({
    queryKey: ['stockMinData'],
    queryFn: () => StockApi.getStockMinuteData(50).then((res) => res.result),
  });
};
