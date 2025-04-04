import { useMutation, useQuery } from '@tanstack/react-query';
import { HTTPError } from 'ky';

import { _kyAuth } from '@/api/instance';
import { handleKyError } from '@/api/instance/errorHandler';
import { ApiResponse } from '@/api/types/common';
import {
  CompanyInfo,
  LimitOrderData,
  MarketOrderData,
  SimulatedData,
  StockMinuteDefaultData,
  StockPeriodDefaultData,
  UserSimulatedData,
} from '@/api/types/stock';
import { queryClient } from '@/lib/queryClient';

export const StockApi = {
  // 회사 기본 정보 가져오기
  getCompanyInfoData: (stockCompanyId: number) =>
    _kyAuth.get(`company/${stockCompanyId}`).json<ApiResponse<CompanyInfo>>(),

  // 분봉 데이터 가져오기 (limit 값은 직접 입력)
  getStockInitMinuteData: (stockId: number, limit: number) =>
    _kyAuth
      .get(`stocks/${stockId}/minute/initial?limit=${limit}`)
      .json<ApiResponse<StockMinuteDefaultData>>(),

  // 분봉 데이터 추가 가져오기
  getStockInitMinunteDataCurser: (companyId: number, cursor: string, limit: number) =>
    _kyAuth
      .get(`stocks/${companyId}/minute`, {
        searchParams: {
          cursor,
          limit,
        },
      })
      .json<ApiResponse<StockMinuteDefaultData>>(),
  // 일,주,월 데이터 가져오기
  getStockInitDailyData: (companyId: number, periodType: number, limit: number) =>
    _kyAuth
      .get(`stocks/${companyId}/daily/initial`, {
        searchParams: {
          periodType,
          limit,
        },
      })
      .json<ApiResponse<StockPeriodDefaultData>>(),

  // 유저 현재 보유 자산
  getUserAsset: (memberId: number | null) =>
    _kyAuth.get(`member/${memberId}/money`).json<ApiResponse<number>>(),

  // 종목별 주식 소유 개수
  getUserStockAccount: (memberId: number | null, companyId: number | null) =>
    _kyAuth.get(`simulated/account/${memberId}/${companyId}`).json<ApiResponse<number>>(),

  // 주문 대기 목록
  getUserSimulated: (memberId: number | null) =>
    _kyAuth.get(`simulated/${memberId}`).json<ApiResponse<UserSimulatedData[]>>(),
  // 주문 취소
  deleteUserSimulated: (orderId: number) =>
    _kyAuth.delete(`simulated/${orderId}`).json<ApiResponse<string>>(),
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
    _kyAuth
      .put(`simulated/${orderId}`, {
        json: orderData,
      })
      .json<ApiResponse<string>>(),

  // 지정가 post
  postStockLimitOrder: (
    memberId: number | null, // 회원 ID
    companyId: number | null, // 종목 ID
    tradeType: number, // 0: 매수(구매), 1:매도(판매)
    quantity: number, // 주 개수
    price: number, // 지정가 - 가격
  ) =>
    _kyAuth
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
    memberId: number | null,
    companyId: number | null,
    tradeType: number,
    quantity: number,
  ) =>
    _kyAuth
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

// 회사 정보(초기) 가져오기
export const useCompanyInfoData = (stockCompanyId: number) => {
  return useQuery({
    queryKey: ['stockCompanyInfo'],
    queryFn: () => StockApi.getCompanyInfoData(stockCompanyId).then((res) => res.result),
  });
};

export const useStockMinuteData = (stockId: number, limit: number) => {
  return useQuery({
    queryKey: ['stockInitMinData', stockId, limit],
    queryFn: () => StockApi.getStockInitMinuteData(stockId, limit).then((res) => res.result),
    refetchInterval: 5000, // 5,000ms = 5초마다 자동 refetch
    refetchIntervalInBackground: true, // 탭이 백그라운드에 있어도 refetch 수행
  });
};

// 분봉(추가데이터 요청)
export const useStockMinuteDataCursor = (companyId: number, cursor: string, limit: number) => {
  return useQuery({
    queryKey: ['stockInitMinDataCursor', companyId, cursor, limit],
    queryFn: () => StockApi.getStockInitMinunteDataCurser(companyId, cursor, limit),
  });
};

// 일,주,월(초기 데이터)
export const useStockDailyData = (companyId: number, periodType: number, limit: number) => {
  return useQuery({
    queryKey: ['stockDailyData', companyId, periodType, limit],
    queryFn: () => StockApi.getStockInitDailyData(companyId, periodType, limit),
  });
};

// export const useStockDayData = (stockId: number, limit: number, periodType: number) => {
//   return useQuery({
//     queryKey: ['DayData'],
//     queryFn: () =>
//       StockApi.getStockInitDayData(stockId, limit, periodType).then((res) => res.result),
//   });
// };

//orderAPI
// 유저 자산 가져오기
export const useUserAssetData = (memberId: number | null) => {
  return useQuery({
    queryKey: ['userAssetData'],
    queryFn: () => StockApi.getUserAsset(memberId).then((res) => res.result),
  });
};

// 종목별 주식 개수 가져오기
export const useUserStockAccountData = (memberId: number | null, companyId: number | null) => {
  return useQuery({
    queryKey: ['stockAccount'],
    queryFn: () => StockApi.getUserStockAccount(memberId, companyId).then((res) => res.result),
  });
};

// 주문 대기 목록
export const useUserSimulatedData = (memberId: number | null) => {
  return useQuery({
    queryKey: ['userSimulated'],
    queryFn: () => StockApi.getUserSimulated(memberId).then((res) => res.result),
  });
};
// 주문 취소
export const useDeleteUserSimulated = () => {
  return useMutation({
    mutationFn: (orderId: number) => StockApi.deleteUserSimulated(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSimulated'] });
    },
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
    onError: (error: HTTPError) => {
      handleKyError(error);
    },
  });
};

// 시장가 판매,구매 api
export const usePostStockMarketOrder = () => {
  return useMutation({
    mutationFn: ({ memberId, companyId, tradeType, quantity }: MarketOrderData) =>
      StockApi.postStockMarketOrder(memberId, companyId, tradeType, quantity),
    onError: (error: HTTPError) => {
      handleKyError(error);
    },
  });
};
