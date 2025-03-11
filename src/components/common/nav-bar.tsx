import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { BlueButton } from '@/components/common/blue-button';
import { MainLogoIcon } from '@/components/common/icons';

export const NavBar = () => {
  return (
    <nav className="flex items-center justify-between bg-[#030D1B] px-10 py-2">
      <button className="duration-300 hover:scale-110">
        <MainLogoIcon className="h-10 w-10" color="white" />
      </button>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-6">
          <button className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color">
            홈
          </button>
          <button className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color">
            알고리즘 LAB
          </button>
          <button className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color">
            모의투자
          </button>
          <button className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color">
            모의교육
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#0D192B] p-3">
          <button className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color">
            <MagnifyingGlassIcon className="h-5 w-5 text-[#718096]" />
          </button>
          <input
            className="bg-transparent text-[#718096]"
            type="text"
            name="search"
            id="search"
            placeholder="기업을 검색하세요."
          />
        </div>
      </div>
      <BlueButton>로그인</BlueButton>
    </nav>
  );
};
