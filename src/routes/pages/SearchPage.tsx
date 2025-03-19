import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const SearchPage = () => {
  return (
    <button className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color">
      <MagnifyingGlassIcon className="h-5 w-5 text-[#718096]" />
      <input
        className="bg-transparent text-[#718096] focus:outline-none"
        type="text"
        name="search"
        id="search"
        placeholder="기업을 검색하세요."
      />
    </button>
  );
};
