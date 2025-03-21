import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { CategoryList } from '@/components/common/category-list';
import { CompanySelectButton } from '@/components/common/company-select-button';
export const SearchPage = () => {
  return (
    <div className="mt-12 flex w-full flex-col items-center justify-center gap-4">
      <div className="mx-5 flex max-w-xl flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-3xl font-bold">종목 검색</h1>
          <p>종목(기업)을 검색하세요.</p>
        </div>
        <div className="flex w-full items-center gap-2 rounded-full bg-[#0D192B] p-4 duration-300 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-color">
          <input
            className="w-full bg-transparent text-[#718096] focus:outline-none"
            type="text"
            name="search"
            id="search"
            placeholder="기업을 검색하세요."
          />

          <button className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color">
            <MagnifyingGlassIcon className="h-5 w-5 text-[#718096]" />
          </button>
        </div>
        <CategoryList />
        <p className="my-3 text-lg text-[#718096]">카테고리 선택으로도 검색이 가능합니다.</p>
        <CompanySelectButton />
      </div>
    </div>
  );
};
