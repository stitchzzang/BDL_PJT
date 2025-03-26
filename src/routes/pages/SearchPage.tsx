import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useSearchedCompanies } from '@/api/home.api';
import { CategoryList } from '@/components/common/category-list';
import { CompanySelectButton } from '@/components/common/company-select-button';

export const SearchPage = () => {
  const [urlParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = urlParams.get('q') || '';

  const [categoryId, setCategoryId] = useState('0');
  const [companyName, setCompanyName] = useState(searchQuery);
  const [searchParams, setSearchParams] = useState({
    categoryId: '0',
    companyName: searchQuery,
  });

  const { data: searchedCompanies, refetch } = useSearchedCompanies(searchParams);

  useEffect(() => {
    setCompanyName(searchQuery);
    setSearchParams({
      categoryId,
      companyName: searchQuery,
    });
  }, [searchQuery, categoryId]);

  const handleSearch = () => {
    navigate(`/search?q=${encodeURIComponent(companyName)}`);
    refetch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
            onClick={handleSearch}
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-[#718096]" />
          </button>
        </div>
        <CategoryList setCategoryId={setCategoryId} />
        <p className="my-3 text-lg text-[#718096]">카테고리 선택으로도 검색이 가능합니다.</p>
        <CompanySelectButton />
      </div>
    </div>
  );
};
