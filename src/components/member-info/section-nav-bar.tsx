import { useNavigate } from 'react-router-dom';

export const SectionNavBar = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex flex-row gap-2">
      <button
        className="rounded-lg px-4 py-2 text-lg text-text-inactive-3-color hover:bg-modal-background-color hover:text-text-main-color active:bg-modal-background-color active:text-text-main-color"
        onClick={() => navigate('/member/stock-tutorial-result')}
      >
        투자 교육 결과
      </button>
      <button
        className="rounded-lg px-4 py-2 text-lg text-text-inactive-3-color hover:bg-modal-background-color hover:text-text-main-color active:bg-modal-background-color active:text-text-main-color"
        onClick={() => navigate('/member/algorithm')}
      >
        알고리즘
      </button>
      <button
        className="rounded-lg px-4 py-2 text-lg text-text-inactive-3-color hover:bg-modal-background-color hover:text-text-main-color active:bg-modal-background-color active:text-text-main-color"
        onClick={() => navigate('/member/investment')}
      >
        투자 리포트
      </button>
    </nav>
  );
};
