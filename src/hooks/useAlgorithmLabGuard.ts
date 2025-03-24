// 알고리즘 랩 페이지 접근 제한 훅
// 이전 페이지에서 데이터가 없으면 현재 페이지로 이동

import { useAlgorithmLabStore } from '@/store/useAlgorithmLabStore';

type PageType = 'name' | 'style' | 'method' | 'market' | 'confirm';

export const useAlgorithmLabGuard = (page: PageType): boolean => {
  const { name, investmentStyle, investmentMethod, investmentAmount, marketResponse } =
    useAlgorithmLabStore();

  // 각 페이지별로 필요한 이전 데이터 체크
  switch (page) {
    case 'confirm':
      if (!marketResponse) {
        return false;
      }
    // fall through : 이전 페이지에서 데이터가 없으면 현재 페이지로 이동
    case 'market':
      if (!investmentMethod || investmentAmount <= 0) {
        return false;
      }
    // fall through : 이전 페이지에서 데이터가 없으면 현재 페이지로 이동
    case 'method':
      if (!investmentStyle) {
        return false;
      }
    // fall through : 이전 페이지에서 데이터가 없으면 현재 페이지로 이동
    case 'style':
      if (!name) {
        return false;
      }
    // fall through : 이전 페이지에서 데이터가 없으면 현재 페이지로 이동
    case 'name':
      return true;
    default:
      return true;
  }
};
