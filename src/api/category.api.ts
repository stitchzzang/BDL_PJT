// 카테고리 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)
import { useQuery } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { Category, Company } from '@/api/types/category';
import { ApiResponse } from '@/api/types/common';

// 실제 API 응답은 categoryList가 아닌 바로 배열로 옵니다
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
        const res = await categoryAPI.getCompaniesByCategory(categoryId);
        return res.result || [];
      } catch (error) {
        console.error('Failed to fetch companies:', error);
        return [];
      }
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });
};
