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
        console.log('카테고리 목록 응답:', res);
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
        const res = await categoryAPI.getCompaniesByCategory(categoryId);
        console.log(`카테고리 ID ${categoryId}의 기업 목록 응답:`, res);
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
