import { useNavigate } from 'react-router-dom';

import { HelpBadge } from '@/components/common/help-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlgorithmLabGuard } from '@/hooks/useAlgorithmLabGuard';
import { InvalidAccessPage } from '@/routes/pages/algorithmLab/InvalidAccessPage';
import { useAlgorithmLabStore } from '@/store/useAlgorithmLabStore';

export const NamePage = () => {
  const isValidAccess = useAlgorithmLabGuard('name');
  const navigate = useNavigate();
  const { name, setName } = useAlgorithmLabStore();

  if (!isValidAccess) {
    return <InvalidAccessPage />;
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">"나만의 자동 매매 전략 만들기"</h1>
      <HelpBadge
        title="안녕하세요! 먼저 전략에 이름을 지어주세요."
        description="여러분이 생성한 알고리즘은 저장하여 나중에 확인이 가능합니다.
        알고리즘 이름을 생성하여 편하게 관리해보세요!"
      />
      <div className="w-full">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="알고리즘 이름을 작성하세요."
          className="h-12"
        />
      </div>
      <div className="flex w-full gap-2">
        <Button variant="blue" onClick={() => navigate('/algorithm-lab')} className="flex-1">
          이전
        </Button>
        <Button
          variant="blue"
          onClick={() => navigate('/algorithm-lab/style')}
          disabled={!name.trim()}
          className="flex-1 disabled:cursor-not-allowed"
        >
          다음
        </Button>
      </div>
    </div>
  );
};
