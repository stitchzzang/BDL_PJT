import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Lanyard } from '@/components/ui/lanyard';

export const BadGatewayPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-2 overflow-hidden">
      <div className="w-[500px]">
        <Lanyard />
      </div>
      <div className="flex flex-col items-center justify-center gap-6">
        <h1 className="text-5xl font-bold text-primary-color">502</h1>
        <div className="flex flex-col items-center gap-2">
          <p className="text-3xl font-medium">BAD GATEWAY</p>
        </div>
        <Button variant="blue" onClick={() => navigate('/')} className="mt-4 px-8 py-6 text-lg">
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
};
