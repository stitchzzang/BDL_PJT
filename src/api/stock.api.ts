import { useMutation, useQuery } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { ApiResponse } from '@/api/types/common';
import {
  LimitOrderData,
  MarketOrderData,
  SimulatedData,
  StockMinuteDefaultData,
  UserSimulatedData,
} from '@/api/types/stock';

export const StockApi = {
  // 분봉 데이터 가져오기 (limit 값은 직접 입력)
  getStockInitMinuteData: (stockId: number, limit: number) =>
    _ky
      .get(`stocks/${stockId}/minute/initial?limit=${limit}`)
      .json<ApiResponse<StockMinuteDefaultData>>(),

  //Order API

  // 유저 현재 보유 자산
  getUserAsset: (memberId: number) =>
    _ky.get(`member/${memberId}/money`).json<ApiResponse<number>>(),

  // 종목별 주식 소유 개수
  getUserStockAccount: (memberId: number, companyId: number) =>
    _ky.get(`simulated/account/${memberId}/${companyId}`).json<ApiResponse<number>>(),

  // 주문 대기 목록
  getUserSimulated: (memberId: number) =>
    _ky.get(`simulated/${memberId}`).json<ApiResponse<UserSimulatedData[]>>(),
  // 주문 취소
  deleteUserSimulated: (orderId: number) =>
    _ky.delete(`simulated/${orderId}`).json<ApiResponse<string>>(),
  // 주문 정정
  changeUserSimulated: (
    orderId: number,
    orderData: {
      memberId: number;
      companyId: number;
      tradeType: number;
      quantity: number;
      price: number;
    },
  ) =>
    _ky
      .put(`simulated/${orderId}`, {
        json: orderData,
      })
      .json<ApiResponse<string>>(),

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

  // 시장가 post
  postStockMarketOrder: (
    memberId: number,
    companyId: number,
    tradeType: number,
    quantity: number,
  ) =>
    _ky
      .post(`simulated/marketorder`, {
        json: {
          memberId: memberId,
          companyId: companyId,
          tradeType: tradeType,
          quantity: quantity,
        },
      })
      .json<ApiResponse<string>>(),
};

export const useStockMinuteData = (stockId: number, limit: number) => {
  return useQuery({
    queryKey: ['stockInitMinData'],
    queryFn: () => StockApi.getStockInitMinuteData(stockId, limit).then((res) => res.result),
  });
};

//orderAPI
// 유저 자산 가져오기
export const useUserAssetData = (memberId: number) => {
  return useQuery({
    queryKey: ['userAssetData'],
    queryFn: () => StockApi.getUserAsset(memberId).then((res) => res.result),
  });
};

// 종목별 주식 개수 가져오기
export const useUserStockAccountData = (memberId: number, companyId: number) => {
  return useQuery({
    queryKey: ['stockAccount'],
    queryFn: () => StockApi.getUserStockAccount(memberId, companyId).then((res) => res.result),
  });
};

// 주문 대기 목록
export const useUserSimulatedData = (memberId: number) => {
  return useQuery({
    queryKey: ['userSimulated'],
    queryFn: () => StockApi.getUserSimulated(memberId).then((res) => res.result),
  });
};
// 주문 취소
export const useDeleteUserSimulated = () => {
  return useMutation({
    mutationFn: (orderId: number) => StockApi.deleteUserSimulated(orderId),
  });
};
// 주문 정정
export const useChangeUserSimulated = () => {
  return useMutation({
    mutationFn: ({ orderId, ...orderData }: SimulatedData) =>
      StockApi.changeUserSimulated(orderId, orderData),
  });
};

// 지정가 판매,구매 api
export const usePostStockLimitOrder = () => {
  return useMutation({
    mutationFn: ({ memberId, companyId, tradeType, quantity, price }: LimitOrderData) =>
      StockApi.postStockLimitOrder(memberId, companyId, tradeType, quantity, price),
  });
};

// 시장가 판매,구매 api
export const usePostStockMarketOrder = () => {
  return useMutation({
    mutationFn: ({ memberId, companyId, tradeType, quantity }: MarketOrderData) =>
      StockApi.postStockMarketOrder(memberId, companyId, tradeType, quantity),
  });
};
