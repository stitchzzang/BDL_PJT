// 카테고리 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)
import { useQuery } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { Category, Company } from '@/api/types/category';
import { ApiResponse } from '@/api/types/common';

// Define the specific response structure for companies by category
interface CompaniesByCategoryResponse {
  companyList: Company[];
}

export const categoryAPI = {
  getCategoryList: () => _ky.get('category').json<ApiResponse<Category[]>>(),
  getCompaniesByCategory: (categoryId: string) =>
    _ky.get(`category/${categoryId}`).json<ApiResponse<CompaniesByCategoryResponse>>(), // Expect the nested structure
};

export const useGetCategoryList = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getCategoryList().then((res) => res.result),
  });
};

export const useGetCompaniesByCategory = (categoryId: string) => {
  return useQuery<Company[]>({
    // The hook still returns Company[]
    queryKey: ['categories', categoryId, 'companies'],
    queryFn: () =>
      categoryAPI.getCompaniesByCategory(categoryId).then((res) => res.result.companyList), // Extract companyList
  });
};
