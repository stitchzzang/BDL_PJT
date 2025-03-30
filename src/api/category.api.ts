// 카테고리 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)
import { useQuery } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { Category, Company } from '@/api/types/category';
import { ApiResponse } from '@/api/types/common';

export const categoryAPI = {
  getCategoryList: () => _ky.get('category').json<ApiResponse<Category[]>>(),
  getCompaniesByCategory: (categoryId: string) =>
    _ky.get(`category/${categoryId}`).json<ApiResponse<Company[]>>(),
};

export const useGetCategoryList = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await categoryAPI.getCategoryList();
        return res.result || [];
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });
};

export const useGetCompaniesByCategory = (categoryId: string) => {
  return useQuery<Company[]>({
    queryKey: ['categories', categoryId, 'companies'],
    queryFn: async () => {
      if (!categoryId) return [];

      try {
        // '0'은 전체 카테고리를 의미
        if (categoryId === '0') {
          // 전체 기업 목록은 각 카테고리의 기업을 모두 가져와서 합침
          const categories = await categoryAPI.getCategoryList().then((res) => res.result || []);

          // 각 카테고리별로 병렬 호출하여 기업 데이터 가져오기
          const allCompaniesPromises = categories.map((category) =>
            categoryAPI
              .getCompaniesByCategory(category.categoryId.toString())
              .then((res) => res.result || [])
              .catch(() => []),
          );

          const companiesByCategory = await Promise.all(allCompaniesPromises);

          // 중복 제거 (companyId 기준)
          const uniqueCompanies = Array.from(
            new Map(
              companiesByCategory.flat().map((company) => [company.companyId, company]),
            ).values(),
          );

          return uniqueCompanies;
        }

        // 특정 카테고리 기업 목록 가져오기
        const res = await categoryAPI.getCompaniesByCategory(categoryId);
        return res.result || [];
      } catch (error) {
        console.error(`Failed to fetch companies for category ${categoryId}:`, error);
        return [];
      }
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });
};
