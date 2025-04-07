import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useSearchedCompanies } from '@/api/home.api';
import { CategoryList } from '@/components/common/category-list';
import { ErrorScreen } from '@/components/common/error-screen';
import { LoadingAnimation } from '@/components/common/loading-animation';
import { SearchAnimation } from '@/components/common/search-animation';
import { SearchedCompanyListItem } from '@/components/home-page/searched-company-list';

export const SearchPage = () => {
  const [urlParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = urlParams.get('q') || '';
  const categoryQuery = urlParams.get('category') || '0';

  const [categoryId, setCategoryId] = useState(categoryQuery);
  const [companyName, setCompanyName] = useState(searchQuery);
  const [searchParams, setSearchParams] = useState({
    categoryId: categoryQuery,
    companyName: searchQuery,
  });
  const [isRotating, setIsRotating] = useState(false);

  const {
    data: searchedCompanies,
    refetch,
    isLoading,
    isError,
  } = useSearchedCompanies(searchParams);

  useEffect(() => {
    setCompanyName(searchQuery);
    setCategoryId(categoryQuery);
    setSearchParams({
      categoryId: categoryQuery,
      companyName: searchQuery,
    });
  }, [searchQuery, categoryQuery]);

  const handleSearch = () => {
    setIsRotating(true);
    navigate(`/search?q=${encodeURIComponent(companyName)}&category=${categoryId}`);
    setTimeout(() => {
      setIsRotating(false);
      refetch();
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 문자열의 실제 바이트 길이를 계산하는 함수
  const getByteLength = (str: string) => {
    // TextEncoder를 사용하여 UTF-8 인코딩된 바이트 길이 계산
    return new TextEncoder().encode(str).length;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 15) {
      alert('검색 가능한 기업명은 15자 이하입니다.');
      return;
    }
    setCompanyName(value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.length > 15) {
      e.preventDefault();
      alert('검색 가능한 기업명은 15자 이하입니다.');
    }
  };

  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);
    navigate(`/search?q=${encodeURIComponent(companyName)}&category=${newCategoryId}`);
    setSearchParams({
      categoryId: newCategoryId,
      companyName,
    });
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3">
      <div className="mx-5 flex max-w-xl flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="group flex flex-col items-center justify-center gap-[10px]">
            <h1 className="text-[28px] font-bold">모의 투자</h1>
            <div className="flex w-full items-center justify-center gap-4 rounded-xl border border-border-color border-opacity-40 p-2 py-4 transition-all duration-300 group-hover:border-btn-blue-color">
              <div>
                <SearchAnimation />
              </div>
              <div>
                <p className="text-[16px]">원하시는 기업의 정보를 확인해보세요!</p>
                <p>
                  <span className="text-[16px] font-bold text-btn-blue-color">기업명</span>을
                  입력하거나{' '}
                  <span className="text-[16px] font-bold text-btn-blue-color">카테고리</span>를
                  선택해보세요.
                </p>
                <p className="text-[16px]">
                  현재가를 확인하고{' '}
                  <span className="text-[16px] font-bold text-btn-blue-color">모의 투자</span>를
                  시작해보세요!
                </p>
              </div>
            </div>
            <div className="flex w-full items-center gap-2 rounded-full border border-border-color border-opacity-40 bg-[#0D192B] p-4 duration-300 focus-within:outline-primary-color hover:border-btn-blue-color">
              <input
                className="w-full bg-transparent text-[#718096] focus:outline-none"
                type="text"
                name="search"
                id="search"
                placeholder="기업을 검색하세요."
                value={companyName}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
              />
              <button
                className="group text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
                onClick={handleSearch}
              >
                <MagnifyingGlassIcon
                  className={`h-5 w-5 text-[#718096] transition-transform duration-300 ${isRotating ? 'animate-rotate text-primary-color' : 'group-hover:animate-rotate group-hover:text-primary-color'}`}
                />
              </button>
            </div>
            <CategoryList setCategoryId={handleCategoryChange} activeCategoryId={categoryId} />
          </div>
          <p className="my-3 text-lg text-[#718096]">카테고리 선택으로도 검색이 가능합니다.</p>
          <div className="w-full min-w-[200px] p-5 sm:min-w-[600px]">
            {isLoading && <LoadingAnimation />}
            {isError && (!searchedCompanies || searchedCompanies.length === 0) && (
              <ErrorScreen onRefresh={refetch} />
            )}
            {!isLoading && searchedCompanies && searchedCompanies.length > 0 && (
              <div className="flex flex-col gap-2">
                {searchedCompanies.map((company) => (
                  <SearchedCompanyListItem key={company.companyId} company={company} />
                ))}
              </div>
            )}
            {!isLoading && searchedCompanies && searchedCompanies.length === 0 && !isError && (
              <div className="flex h-full w-full items-center justify-center rounded-[20px] border border-btn-primary-inactive-color bg-modal-background-color p-5">
                <p className="text-center text-lg text-[#718096]">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
