import { useMutation, useQuery } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { ApiResponse } from '@/api/types/common';
import { LimitOrderData, StockMinuteData } from '@/api/types/stock';

export const StockApi = {
  // 분봉 데이터 가져오기 (limit 값은 직접 입력)
  getStockInitMinuteData: (stockId: string, limit: number) =>
    _ky
      .get(`stocks/${stockId}/minute/initial?limit=${limit}`)
      .json<ApiResponse<StockMinuteData[]>>(),

  //Order API
  // 유저 현재 보유 자산
  getUserAsset: (memberId: number) =>
    _ky.get(`member/${memberId}/money`).json<ApiResponse<number>>(),

  // 지정가 post
  postStockLimitOrder: (
    memberId: number, // 회원 ID
    companyId: number, // 종목 ID
    tradeType: number, // 0: 매수(구매), 1:매도(판매)
    quantity: number, // 주 개수
    price: number, // 지정가 - 가격
  ) =>
    _ky
      .post(`simulated/limitorder`, {
        json: {
          memberId: memberId,
          companyId: companyId,
          tradeType: tradeType,
          quantity: quantity,
          price: price,
        },
      })
      .json<ApiResponse<string>>(),
};

export const useStockMinuteData = (stockId: string, limit: number) => {
  return useQuery({
    queryKey: ['stockInitMinData'],
    queryFn: () => StockApi.getStockInitMinuteData(stockId, limit).then((res) => res.result),
  });
};

//orderAPI
export const useUserAssetData = (memberId: number) => {
  return useQuery({
    queryKey: ['userAssetData'],
    queryFn: () => StockApi.getUserAsset(memberId).then((res) => res.result),
  });
};

// 지정가 판매,구매 api
export const usePostStockLimitOrder = () => {
  return useMutation({
    mutationFn: ({ memberId, companyId, tradeType, quantity, price }: LimitOrderData) =>
      StockApi.postStockLimitOrder(memberId, companyId, tradeType, quantity, price),
  });
};
