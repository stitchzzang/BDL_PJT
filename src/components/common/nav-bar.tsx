import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

import { MainLogoIcon } from '@/components/common/icons';
import { Button } from '@/components/ui/button';

export const NavBar = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between bg-[#030D1B] px-10 py-2">
      <button className="duration-300 hover:scale-110" onClick={() => navigate('/')}>
        <MainLogoIcon className="h-10 w-10" color="white" />
      </button>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-6">
          <button
            className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
            onClick={() => navigate('/')}
          >
            홈
          </button>
          <button
            className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
            onClick={() => navigate('/algorithm-lab')}
          >
            알고리즘 LAB
          </button>
          <button
            className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
            onClick={() => navigate('/simulated-investment')}
          >
            모의투자
          </button>
          <button
            className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
            onClick={() => navigate('/simulated-education')}
          >
            모의교육
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#0D192B] p-3 duration-300 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-color">
          <button
            className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
            onClick={() => navigate('/search')}
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-[#718096]" />
          </button>
          <input
            className="bg-transparent text-[#718096] focus:outline-none"
            type="text"
            name="search"
            id="search"
            placeholder="기업을 검색하세요."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate('/search');
              }
            }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="blue" onClick={() => navigate('/login')}>
          로그인
        </Button>
        <button onClick={() => navigate('/member/stock-tutorial-result')}>
          <img
            src="/none-img/none_profile_img.png"
            alt="profile"
            className="h-[40px] w-[40px] rounded-full border border-primary-color"
          />
        </button>
      </div>
    </nav>
  );
};
