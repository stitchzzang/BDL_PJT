// 홈 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)

import { useQuery } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { ApiResponse } from '@/api/types/common';
import {
  HomeChartKosdaqKospiData,
  HomeCompanyRankTradeData,
  LatestNews,
  SearchedCompany,
  SearchedCompanyResponse,
  UserRanking,
} from '@/api/types/home';

export const homeApi = {
  getLatestNews: () => _ky.get('news/latest').json<ApiResponse<LatestNews[]>>(),
  getSearchedCompanies: ({ categoryId, companyName }: SearchedCompany) =>
    _ky
      .get('company/search', {
        searchParams: {
          keyword: companyName ?? '',
          categoryId: categoryId ?? '',
        },
      })
      .json<ApiResponse<SearchedCompanyResponse[]>>(),
  getUserRanking: () => _ky.get('tutorial/rankings').json<ApiResponse<UserRanking[]>>(),

  // 홈 코스피, 코스닥 데이터 가져오기
  getKosdaqKospiData: () =>
    _ky.get(`stock/index-candles`).json<ApiResponse<HomeChartKosdaqKospiData>>(),
  // 랭킹 기본정보(거래대금)
  getRankingVolume: () => _ky.get(`ranking/tradeData/volume`).json<HomeCompanyRankTradeData[]>(),
  // 랭킹 기본정보(높낮이이)
  getRankingChangeRate: (category: string) =>
    _ky.get(`ranking/tradeData/changeRate/${category}`).json<HomeCompanyRankTradeData[]>(),
};

export const useLatestNews = () => {
  return useQuery({
    queryKey: ['latestNews'],
    queryFn: () => homeApi.getLatestNews().then((res) => res.result),
  });
};

export const useSearchedCompanies = ({ categoryId, companyName }: SearchedCompany) => {
  return useQuery<SearchedCompanyResponse[]>({
    queryKey: ['searchedCompanies', categoryId, companyName],
    queryFn: () =>
      homeApi.getSearchedCompanies({ categoryId, companyName }).then((res) => res.result),
  });
};

export const useUserRanking = () => {
  return useQuery({
    queryKey: ['userRankings'],
    queryFn: () => homeApi.getUserRanking().then((res) => res.result),
  });
};

export const useKosdaqKospiData = () => {
  return useQuery({
    queryKey: ['KosdaqKospiData'],
    queryFn: () => homeApi.getKosdaqKospiData().then((res) => res.result),
  });
};

// 랭킹 (거래대금)
export const useRankingVolume = () => {
  return useQuery({
    queryKey: ['VolumeFirstData'],
    queryFn: () => homeApi.getRankingVolume().then((res) => res),
  });
};

// 랭킹 (높낮이)
export const useRankingChangeRate = (category: string) => {
  return useQuery({
    queryKey: ['ChangeRateFirstData'],
    queryFn: () => homeApi.getRankingChangeRate(category).then((res) => res),
  });
};
