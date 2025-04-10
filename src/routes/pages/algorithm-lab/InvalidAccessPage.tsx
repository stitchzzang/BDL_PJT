import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Lanyard } from '@/components/ui/lanyard';

export const InvalidAccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <Lanyard />
      <h1 className="text-4xl font-bold">올바르지 않은 접근입니다</h1>
      <p className="text-lg text-gray-600">알고리즘 생성은 처음부터 순서대로 진행해야 합니다.</p>
      <Button
        variant="blue"
        onClick={() => navigate('/algorithm-lab')}
        className="mt-4 px-8 py-6 text-lg"
      >
        알고리즘 랩으로 이동
      </Button>
    </div>
  );
};
