import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Lanyard } from '@/components/ui/lanyard';

export const PermissionDeniedPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-2 overflow-hidden">
      <div className="w-[500px]">
        <Lanyard />
      </div>
      <div className="flex flex-col items-center justify-center gap-6">
        <h1 className="text-5xl font-bold text-primary-color">403</h1>
        <div className="flex flex-col items-center gap-2">
          <p className="text-3xl font-medium">권한이 없습니다.</p>
          <p className="text-lg text-text-inactive-3-color">권한이 없는 페이지에 접근하였습니다.</p>
        </div>
        <Button variant="blue" onClick={() => navigate('/')} className="mt-4 px-8 py-6 text-lg">
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
};
