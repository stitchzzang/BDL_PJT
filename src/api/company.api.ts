// 회사 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)
import { useQuery } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import {
  CompanyProfile,
  CompanyBasicInfo,
  CompanyFinancialRatio,
  CompanyProfitabilityRatio,
} from '@/api/types/company';
import { ApiResponse } from '@/api/types/common';

export const companyAPI = {
  getCompanyProfile: (companyId: string) =>
    _ky.get(`stock/profile`, { searchParams: { companyId } }).json<ApiResponse<CompanyProfile>>(),

  getCompanyBasicInfo: (companyId: string) =>
    _ky.get(`company/${companyId}/basic`).json<ApiResponse<CompanyBasicInfo>>(),

  getCompanyFinancialRatio: (companyId: string) =>
    _ky.get(`company/${companyId}/fin`).json<ApiResponse<CompanyFinancialRatio>>(),

  getCompanyProfitabilityRatio: (companyId: string) =>
    _ky.get(`company/${companyId}/profit`).json<ApiResponse<CompanyProfitabilityRatio>>(),
};

export const useGetCompanyProfile = (companyId: string) => {
  return useQuery<CompanyProfile>({
    queryKey: ['company', companyId, 'profile'],
    queryFn: () => companyAPI.getCompanyProfile(companyId).then((res) => res.result),
  });
};

export const useGetCompanyBasicInfo = (companyId: string) => {
  return useQuery<CompanyBasicInfo>({
    queryKey: ['company', companyId, 'basic'],
    queryFn: () => companyAPI.getCompanyBasicInfo(companyId).then((res) => res.result),
  });
};

export const useGetCompanyFinancialRatio = (companyId: string) => {
  return useQuery<CompanyFinancialRatio>({
    queryKey: ['company', companyId, 'financial'],
    queryFn: () => companyAPI.getCompanyFinancialRatio(companyId).then((res) => res.result),
  });
};

export const useGetCompanyProfitabilityRatio = (companyId: string) => {
  return useQuery<CompanyProfitabilityRatio>({
    queryKey: ['company', companyId, 'profitability'],
    queryFn: () => companyAPI.getCompanyProfitabilityRatio(companyId).then((res) => res.result),
  });
};
