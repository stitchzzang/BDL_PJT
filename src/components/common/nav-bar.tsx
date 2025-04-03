import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useLogout } from '@/api/auth.api';
import { MainLogoIcon } from '@/components/common/icons';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

export const NavBar = () => {
  const { isLogin, userData } = useAuthStore();
  const { mutate: logout } = useLogout();
  const [searchValue, setSearchValue] = useState('');
  const [isRotating, setIsRotating] = useState(false);
  const navigate = useNavigate();

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
    }
  };

  return (
    <nav className="mb-[60px] flex items-center justify-between bg-[#030D1B] px-10 py-3 shadow-xl shadow-white/10">
      <NavLink to="/" className="duration-300 hover:scale-110">
        <MainLogoIcon className="h-10 w-10" color="white" />
      </NavLink>

      {/* 데스크탑 메뉴 */}
      <div className="flex items-center gap-4">
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
              `text-text-inactive-color hover:text-text-main-color active:text-text-main-color mr-7 ${
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
            className="w-72 bg-transparent text-[#718096] focus:outline-none"
            type="text"
            name="search"
            placeholder="모의투자를 진행할 기업을 검색해보세요."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </div>
      </div>

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
              className="h-[40px] w-[40px] rounded-full border-2 border-transparent object-cover transition-all duration-300 hover:scale-110"
            />
          </NavLink>
        )}
      </div>
    </nav>
  );
};
