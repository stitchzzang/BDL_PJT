import { useNavigate } from 'react-router-dom';

import { HelpBadge } from '@/components/common/help-badge';
import { RocketBgAnimation } from '@/components/common/rocket-bg-animation';
import { Button } from '@/components/ui/button';

export const StartPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">
          <span className="text-btn-blue-color">알고리즘</span> LAB
        </h1>
        <p className="text-lg">오신 것을 환영합니다.</p>
      </div>
      <div className="flex w-full flex-col items-center gap-1">
        <div>
          <RocketBgAnimation height={200} width={200} />
        </div>
        <HelpBadge
          title="주식에 익숙하지 않은 당신"
          description="주식, 알고리즘 모든게 익숙하지 않으신가요? 걱정하지 마세요.
            여러분을 위해 쉬운 방법으로 도와드릴게요."
        />
      </div>
      <HelpBadge
        title="처음이라면 이렇게 작성해볼까요?"
        description="저희가 권장하는 ‘권장값’을 유지하며 옵션을 선택해보세요.
            안정적인 투자로 위험 요소를 줄일수 있습니다."
        bgColor="bg-btn-green-color/20"
      />
      <Button
        className="w-full"
        variant="blue"
        size="lg"
        onClick={() => navigate('/algorithm-lab/name')}
      >
        알고리즘 생성하기
      </Button>
    </div>
  );
};
