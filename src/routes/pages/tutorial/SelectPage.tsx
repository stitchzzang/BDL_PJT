import { useState, useEffect } from 'react';

import NoneLogo from '/none-img/none-logo.png';
import { CategoryList } from '@/components/common/category-list';
import { CompanySelectButton } from '@/components/common/company-select-button';
import { useGetCompaniesByCategory } from '@/api/category.api';

export const SelectPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('0');
  const {
    data: companies = [],
    isLoading,
    isFetching,
    isError,
  } = useGetCompaniesByCategory(selectedCategory);

  const isLoadingData = isLoading || isFetching;
  const hasCompanies = companies && companies.length > 0;

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
        {isLoadingData ? (
          <div className="flex justify-center items-center h-20">
            <p className="text-[16px]">기업 목록을 불러오는 중...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-[200px]">
            <img src={NoneLogo} alt="오류 발생" className="w-[100px] h-[100px] opacity-70 mb-4" />
            <p className="text-[16px]">데이터를 불러오는 중 오류가 발생했습니다.</p>
            <p className="text-[14px] text-gray-400 mt-2">잠시 후 다시 시도해주세요.</p>
          </div>
        ) : hasCompanies ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-[600px]">
            <h2 className="text-[20px] font-bold">기업 선택</h2>
            {companies.map((company) => (
              <CompanySelectButton key={company.companyId} company={company} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px]">
            <p className="text-[16px]">데이터가 없습니다.</p>
            <p className="text-[14px] text-gray-400 mt-2">다른 카테고리를 선택해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};
