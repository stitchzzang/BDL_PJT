import { NavLink } from 'react-router-dom';

import { useLogout } from '@/api/auth.api';
import { MainLogoIcon } from '@/components/common/icons';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

export const NavBar = () => {
  const { isLogin, userData } = useAuthStore();
  const { mutate: logout } = useLogout();

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
            to="/investment/search"
            className={({ isActive }) =>
              `text-text-inactive-color hover:text-text-main-color active:text-text-main-color ${
                isActive ? 'text-text-main-color' : ''
              }`
            }
          >
            모의 투자
          </NavLink>
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
