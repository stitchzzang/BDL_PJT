import { Outlet } from 'react-router-dom';

export const AlgorithmLabLayout = () => {
  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-[500px] px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
};
