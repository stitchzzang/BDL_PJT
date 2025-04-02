import { Bars3Icon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useLogout } from '@/api/auth.api';
import { MainLogoIcon } from '@/components/common/icons';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

export const NavBar = () => {
  const { isLogin, userData } = useAuthStore();
  const { mutate: logout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isRotating, setIsRotating] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = () => {
    setIsRotating(true);
    setTimeout(() => {
      setIsRotating(false);
      setSearchValue('');
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
      setIsOpen(false);
    }
  };

  return (
    <nav className="mb-[60px] flex items-center justify-between bg-[#030D1B] px-4 py-3 shadow-xl shadow-white/10 webapp:px-10">
      <NavLink to="/" className="duration-300 hover:scale-110">
        <MainLogoIcon className="h-8 w-8 webapp:h-10 webapp:w-10" color="white" />
      </NavLink>

      {/* 데스크탑 메뉴 */}
      <div className="hidden webapp:flex webapp:items-center webapp:gap-4">
        <div className="flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-text-inactive-color hover:text-text-main-color active:text-text-main-color ${
                isActive ? 'text-text-main-color' : ''
              }`
            }
          >
            홈
          </NavLink>
          <NavLink
            to="/algorithm-lab"
            className={({ isActive }) =>
              `text-text-inactive-color hover:text-text-main-color active:text-text-main-color ${
                isActive ? 'text-text-main-color' : ''
              }`
            }
          >
            알고리즘 LAB
          </NavLink>
          <NavLink
            to="/tutorial"
            className={({ isActive }) =>
              `text-text-inactive-color hover:text-text-main-color active:text-text-main-color ${
                isActive ? 'text-text-main-color' : ''
              }`
            }
          >
            주식 튜토리얼
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `text-text-inactive-color hover:text-text-main-color active:text-text-main-color ${
                isActive ? 'text-text-main-color' : ''
              }`
            }
          >
            모의 투자
          </NavLink>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#0D192B] p-3 duration-300 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-color">
          <button
            onClick={handleSearch}
            className="group text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
          >
            <MagnifyingGlassIcon
              className={`h-5 w-5 text-[#718096] transition-transform duration-300 ${isRotating ? 'animate-rotate text-primary-color' : 'group-hover:animate-rotate group-hover:text-primary-color'}`}
            />
          </button>
          <input
            className="w-32 bg-transparent text-[#718096] focus:outline-none md:w-40"
            type="text"
            name="search"
            placeholder="기업을 검색하세요."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isOpen && (
        <div className="absolute left-0 top-[52px] z-50 w-full bg-[#030D1B] px-4 py-4 webapp:hidden">
          <div className="flex flex-col gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-left text-text-inactive-color hover:text-text-main-color active:text-text-main-color ${
                  isActive ? 'text-text-main-color' : ''
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              홈
            </NavLink>
            <NavLink
              to="/algorithm-lab"
              className={({ isActive }) =>
                `text-left text-text-inactive-color hover:text-text-main-color active:text-text-main-color ${
                  isActive ? 'text-text-main-color' : ''
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              알고리즘 LAB
            </NavLink>
            <NavLink
              to="/tutorial"
              className={({ isActive }) =>
                `text-left text-text-inactive-color hover:text-text-main-color active:text-text-main-color ${
                  isActive ? 'text-text-main-color' : ''
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              주식 튜토리얼
            </NavLink>
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `text-left text-text-inactive-color hover:text-text-main-color active:text-text-main-color ${
                  isActive ? 'text-text-main-color' : ''
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              모의 투자
            </NavLink>
            <div className="flex items-center gap-2 rounded-full bg-[#0D192B] p-3">
              <button
                onClick={handleSearch}
                className="group text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
              >
                <MagnifyingGlassIcon
                  className={`h-5 w-5 text-[#718096] transition-transform duration-300 ${isRotating ? 'animate-rotate text-primary-color' : 'group-hover:animate-rotate group-hover:text-primary-color'}`}
                />
              </button>
              <input
                className="w-full bg-transparent text-[#718096] focus:outline-none"
                type="text"
                name="search-mobile"
                placeholder="기업을 검색하세요."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
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
        {isLogin ? (
          <>
            <Button
              variant="blue"
              onClick={() => {
                logout();
              }}
            >
              로그아웃
            </Button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="text-text-inactive-color hover:text-text-main-color">
              <Button variant="blue">로그인</Button>
            </NavLink>
          </>
        )}

        {isLogin && (
          <NavLink
            to="/member"
            className={({ isActive }) =>
              isActive
                ? 'rounded-full border-2 border-primary-color transition-all duration-300 hover:border-primary-color'
                : 'rounded-full border border-text-main-color transition-all duration-300 hover:border-text-main-color'
            }
          >
            <img
              src={userData.profile || '/none-img/none_profile_img.png'}
              alt="profile"
              className="h-[32px] w-[32px] rounded-full border-2 border-transparent object-cover transition-all duration-300 hover:scale-110 webapp:h-[40px] webapp:w-[40px]"
            />
          </NavLink>
        )}
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
