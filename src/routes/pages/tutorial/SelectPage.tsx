import { useState, useEffect } from 'react';

import NoneLogo from '/none-img/none-logo.png';
import { CategoryList } from '@/components/common/category-list';
import { CompanySelectButton } from '@/components/common/company-select-button';
import { useGetCompaniesByCategory } from '@/api/category.api';
import { Company } from '@/api/types/category';

export const SelectPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const {
    data: companies = [],
    isLoading,
    isFetching,
  } = useGetCompaniesByCategory(selectedCategory);

  useEffect(() => {
    // 초기 카테고리를 '전체'로 설정
    if (!selectedCategory) {
      setSelectedCategory('0');
    }
  }, []);

  const isLoadingData = isLoading || isFetching;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex flex-col items-center justify-center">
          <h1 className="mb-[10px] text-[28px] font-bold">주식 튜토리얼</h1>
          <p className="text-[16px]">주식에 익숙하지 않은 당식을 위하여</p>
          <span className="text-[16px] font-bold">적응을 도와드릴게요.</span>
          <p className="text-[16px]">
            먼저 경험하고 싶은{' '}
            <span className="text-[16px] font-bold text-btn-blue-color">카테고리</span>를
            골라볼까요?
          </p>
        </div>
        <div>
          <CategoryList setCategoryId={setSelectedCategory} activeCategoryId={selectedCategory} />
        </div>
      </div>
      <div className="mt-[50px] flex flex-col items-center gap-4 w-full">
        <p className="text-[16px] text-center text-gray-400">
          카테고리 선택으로도 검색이 가능합니다.
        </p>
        {isLoadingData ? (
          <div className="flex justify-center items-center h-20">
            <p className="text-[16px]">기업 목록을 불러오는 중...</p>
          </div>
        ) : companies && companies.length > 0 ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-[600px]">
            <h2 className="text-[20px] font-bold">기업 선택</h2>
            {companies.map((company) => (
              <CompanySelectButton key={company.companyId} company={company} />
            ))}
          </div>
        ) : selectedCategory ? (
          <div className="flex flex-col items-center justify-center h-[200px]">
            <img src={NoneLogo} alt="데이터 없음" className="w-[100px] h-[100px] opacity-70 mb-4" />
            <p className="text-[16px]">잠시 후 다시 시도해주세요.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
