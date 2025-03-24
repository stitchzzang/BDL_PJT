import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export const StartPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">알고리즘 LAB</h1>
        <p className="text-lg">오신 것을 환영합니다.</p>
      </div>
      <div className="flex w-full flex-col gap-5">
        <div className="flex w-full flex-col gap-2 rounded-2xl border border-btn-primary-inactive-color bg-modal-background-color p-5">
          <p className="text-lg font-bold">주식에 익숙하지 않는 당신</p>
          <p className="text-sm">
            주식, 알고리즘 모든게 익숙하지 않으신가요? 걱정하지 마세요.
            <br />
            여러분을 위해 쉬운 방법으로 도와드릴게요.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 rounded-2xl border border-btn-primary-inactive-color bg-btn-green-color/20 p-5">
          <p className="text-lg font-bold">처음이라면 이렇게 작성해볼까요?</p>
          <p className="text-sm">
            저희가 권장하는 ‘권장값’을 유지하며 옵션을 선택해보세요.
            <br />
            안정적인 투자로 위험 요소를 줄일수 있습니다.
          </p>
        </div>
        <Button
          className="w-full"
          variant="blue"
          size="lg"
          onClick={() => navigate('/algorithm-lab/name')}
        >
          알고리즘 생성하기
        </Button>
      </div>
    </div>
  );
};
