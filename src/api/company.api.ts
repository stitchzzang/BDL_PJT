// 회사 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)
import { useQuery } from '@tanstack/react-query';

import { _kyAuth } from '@/api/instance';
import { ApiResponse } from '@/api/types/common';
import {
  CompanyBasicInfo,
  CompanyFinancialRatio,
  CompanyProfile,
  CompanyProfitabilityRatio,
} from '@/api/types/company';

export const companyAPI = {
  getCompanyProfile: (companyId: string) =>
    _kyAuth.get(`company/${companyId}`).json<ApiResponse<CompanyProfile>>(),

  getCompanyBasicInfo: (companyId: string) =>
    _kyAuth.get(`company/${companyId}/basic`).json<ApiResponse<CompanyBasicInfo>>(),

  getCompanyFinancialRatio: (companyId: string) =>
    _kyAuth.get(`company/${companyId}/fin`).json<ApiResponse<CompanyFinancialRatio>>(),

  getCompanyProfitabilityRatio: (companyId: string) =>
    _kyAuth.get(`company/${companyId}/profit`).json<ApiResponse<CompanyProfitabilityRatio>>(),
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
