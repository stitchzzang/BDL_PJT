import { Bars3Icon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { MainLogoIcon } from '@/components/common/icons';
import { Button } from '@/components/ui/button';

export const NavBar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="mb-[60px] flex items-center justify-between bg-[#030D1B] px-4 py-3 shadow-xl shadow-white/10 webapp:px-10">
      <button className="duration-300 hover:scale-110" onClick={() => navigate('/')}>
        <MainLogoIcon className="h-8 w-8 webapp:h-10 webapp:w-10" color="white" />
      </button>

      {/* 데스크탑 메뉴 */}
      <div className="hidden webapp:flex webapp:items-center webapp:gap-4">
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
            onClick={() => navigate('/tutorial/select')}
          >
            주식 튜토리얼
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
            className="w-32 bg-transparent text-[#718096] focus:outline-none md:w-40"
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

      {/* 모바일 메뉴 */}
      {isOpen && (
        <div className="absolute left-0 top-[52px] z-50 w-full bg-[#030D1B] px-4 py-4 webapp:hidden">
          <div className="flex flex-col gap-4">
            <button
              className="text-left text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
              onClick={() => {
                navigate('/');
                setIsOpen(false);
              }}
            >
              홈
            </button>
            <button
              className="text-left text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
              onClick={() => {
                navigate('/algorithm-lab');
                setIsOpen(false);
              }}
            >
              알고리즘 LAB
            </button>
            <button
              className="text-left text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
              onClick={() => {
                navigate('/simulated-investment');
                setIsOpen(false);
              }}
            >
              모의투자
            </button>
            <button
              className="text-left text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
              onClick={() => {
                navigate('/tutorial/select');
                setIsOpen(false);
              }}
            >
              주식 튜토리얼
            </button>
            <div className="flex items-center gap-2 rounded-full bg-[#0D192B] p-3">
              <button
                className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
                onClick={() => {
                  navigate('/search');
                  setIsOpen(false);
                }}
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-[#718096]" />
              </button>
              <input
                className="w-full bg-transparent text-[#718096] focus:outline-none"
                type="text"
                name="search-mobile"
                id="search-mobile"
                placeholder="기업을 검색하세요."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate('/search');
                    setIsOpen(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 로그인/프로필 영역 */}
      <div className="flex items-center gap-2">
        <Button variant="blue" onClick={() => navigate('/login')}>
          로그인
        </Button>
        <button onClick={() => navigate('/member/stock-tutorial-result')}>
          <img
            src="/none-img/none_profile_img.png"
            alt="profile"
            className="h-[32px] w-[32px] rounded-full border border-primary-color webapp:h-[40px] webapp:w-[40px]"
          />
        </button>
        {/* 모바일 메뉴 토글 버튼 */}
        <button className="ml-2 webapp:hidden" onClick={toggleMenu}>
          {isOpen ? (
            <XMarkIcon className="h-8 w-8 text-white" />
          ) : (
            <Bars3Icon className="h-8 w-8 text-white" />
          )}
        </button>
      </div>
    </nav>
  );
};
