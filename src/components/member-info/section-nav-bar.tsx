import { NavLink } from 'react-router-dom';

export const SectionNavBar = () => {
  return (
    <nav className="flex flex-row gap-2">
      <NavLink
        to="/member/stock-tutorial-result"
        className={({ isActive }) =>
          `rounded-lg px-4 py-2 text-lg transition-colors ${
            isActive
              ? 'bg-modal-background-color text-text-main-color'
              : 'text-text-inactive-3-color hover:bg-modal-background-color hover:text-text-main-color'
          }`
        }
      >
        투자 교육 결과
      </NavLink>
      <NavLink
        to="/member/algorithm"
        className={({ isActive }) =>
          `rounded-lg px-4 py-2 text-lg transition-colors ${
            isActive
              ? 'bg-modal-background-color text-text-main-color'
              : 'text-text-inactive-3-color hover:bg-modal-background-color hover:text-text-main-color'
          }`
        }
      >
        알고리즘
      </NavLink>
      <NavLink
        to="/member/investment"
        className={({ isActive }) =>
          `rounded-lg px-4 py-2 text-lg transition-colors ${
            isActive
              ? 'bg-modal-background-color text-text-main-color'
              : 'text-text-inactive-3-color hover:bg-modal-background-color hover:text-text-main-color'
          }`
        }
      >
        투자 리포트
      </NavLink>
    </nav>
  );
};
