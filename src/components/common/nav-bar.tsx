import { Bars3Icon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { useLogout } from '@/api/auth.api';
import { MainLogoIcon } from '@/components/common/icons';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

export const NavBar = () => {
  const { isLogin } = useAuthStore();
  const { mutate: logout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
            to="/simulated-investment"
            className={({ isActive }) =>
              `text-text-inactive-color hover:text-text-main-color active:text-text-main-color ${
                isActive ? 'text-text-main-color' : ''
              }`
            }
          >
            모의투자
          </NavLink>
          <NavLink
            to="/tutorial/select"
            className={({ isActive }) =>
              `text-text-inactive-color hover:text-text-main-color active:text-text-main-color ${
                isActive ? 'text-text-main-color' : ''
              }`
            }
          >
            주식 튜토리얼
          </NavLink>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#0D192B] p-3 duration-300 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-color">
          <NavLink
            to="/search"
            className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-[#718096]" />
          </NavLink>
          <input
            className="w-32 bg-transparent text-[#718096] focus:outline-none md:w-40"
            type="text"
            name="search"
            id="search"
            placeholder="기업을 검색하세요."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                window.location.href = '/search';
              }
            }}
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
              to="/simulated-investment"
              className={({ isActive }) =>
                `text-left text-text-inactive-color hover:text-text-main-color active:text-text-main-color ${
                  isActive ? 'text-text-main-color' : ''
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              모의투자
            </NavLink>
            <NavLink
              to="/tutorial/select"
              className={({ isActive }) =>
                `text-left text-text-inactive-color hover:text-text-main-color active:text-text-main-color ${
                  isActive ? 'text-text-main-color' : ''
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              주식 튜토리얼
            </NavLink>
            <div className="flex items-center gap-2 rounded-full bg-[#0D192B] p-3">
              <NavLink
                to="/search"
                className="text-text-inactive-color hover:text-text-main-color active:text-text-main-color"
                onClick={() => setIsOpen(false)}
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-[#718096]" />
              </NavLink>
              <input
                className="w-full bg-transparent text-[#718096] focus:outline-none"
                type="text"
                name="search-mobile"
                id="search-mobile"
                placeholder="기업을 검색하세요."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    window.location.href = '/search';
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

        <NavLink to="/member">
          <img
            src="/none-img/none_profile_img.png"
            alt="profile"
            className="h-[32px] w-[32px] rounded-full border border-primary-color webapp:h-[40px] webapp:w-[40px]"
          />
        </NavLink>
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
