import { useNavigate } from 'react-router-dom';

import { HelpBadge } from '@/components/common/help-badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAlgorithmLabGuard } from '@/hooks/useAlgorithmLabGuard';
import { InvalidAccessPage } from '@/routes/pages/algorithmLab/InvalidAccessPage';
import { useAlgorithmLabStore } from '@/store/useAlgorithmLabStore';

export const StylePage = () => {
  const isValidAccess = useAlgorithmLabGuard('style');
  const navigate = useNavigate();
  const {
    investmentStyle,
    setInvestmentStyle,
    riseResponse,
    fallResponse,
    setRiseResponse,
    setFallResponse,
  } = useAlgorithmLabStore();

  if (!isValidAccess) {
    return <InvalidAccessPage />;
  }

  // 해당 범위 내에 있는지 확인
  const isConservativeValid =
    riseResponse >= 3 && riseResponse <= 5 && fallResponse >= 1 && fallResponse <= 2;
  const isBalancedValid =
    riseResponse >= 8 && riseResponse <= 12 && fallResponse >= 3 && fallResponse <= 5;
  const isAggressiveValid =
    riseResponse >= 15 && riseResponse <= 25 && fallResponse >= 7 && fallResponse <= 10;

  // 투자 스타일 클릭 시 이벤트 핸들러
  const handleStyleClick = (
    style: 'conservative' | 'balanced' | 'aggressive',
    riseValue: number,
    fallValue: number,
  ) => {
    setInvestmentStyle(style);
    setRiseResponse(riseValue);
    setFallResponse(fallValue);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <h2 className="text-3xl font-bold">투자 스타일 선택</h2>
      <HelpBadge
        title="어떤 투자 스타일을 선호하시나요?"
        description="3가지 선택지 중 가장 선호하는 투자 스타일을 선택해주세요."
      />
      <div className="flex w-full flex-col gap-4">
        <Button
          variant="green"
          onClick={() => handleStyleClick('conservative', 4, 1.5)}
          className={`flex w-full flex-col items-start p-4 ${
            isConservativeValid || investmentStyle === 'conservative'
              ? 'bg-btn-green-color'
              : 'bg-btn-green-color/20'
          }`}
        >
          <p className="font-bold">보수적(안정적 중시형)</p>
          <p className="whitespace-normal text-sm">
            작은 이익을 안정적으로 추구하고 손실은 최소화합니다.
          </p>
          <p className="mt-1 text-xs text-gray-600">이익률: 3~5%, 손절매: 1~2%</p>
        </Button>
        <Button
          variant="yellow"
          onClick={() => handleStyleClick('balanced', 10, 4)}
          className={`flex w-full flex-col items-start p-4 ${
            isBalancedValid || investmentStyle === 'balanced'
              ? 'bg-btn-yellow-color'
              : 'bg-btn-yellow-color/20'
          }`}
        >
          <p className="font-bold">균형적(중립형)</p>
          <p className="whitespace-normal text-sm">이익과 위험 사이의 균형을 유지합니다.</p>
          <p className="mt-1 text-xs text-gray-600">이익률: 8~12%, 손절매: 3~5%</p>
        </Button>
        <Button
          variant="red"
          onClick={() => handleStyleClick('aggressive', 20, 8.5)}
          className={`flex w-full flex-col items-start p-4 ${
            isAggressiveValid || investmentStyle === 'aggressive'
              ? 'bg-btn-red-color'
              : 'bg-btn-red-color/20'
          }`}
        >
          <p className="font-bold">공격적(수익 지향형)</p>
          <p className="whitespace-normal text-sm">더 큰 이익을 위해 더 큰 위험을 감수합니다.</p>
          <p className="mt-1 text-xs text-gray-600">이익률: 15~25%, 손절매: 7~10%</p>
        </Button>
      </div>
      <div className="flex w-full max-w-md flex-col gap-2">
        <p className="mb-2 text-sm text-gray-600">이익률 ({riseResponse}%)</p>
        <Slider
          value={[riseResponse]}
          onValueChange={(value) => {
            setRiseResponse(value[0]);
            setInvestmentStyle(null);
          }}
          min={1}
          max={30}
          step={0.5}
        />
        <p className="text-sm text-gray-600">손절매 ({fallResponse}%)</p>
        <Slider
          value={[fallResponse]}
          onValueChange={(value) => {
            setFallResponse(value[0]);
            setInvestmentStyle(null);
          }}
          min={1}
          max={30}
          step={0.5}
        />
      </div>
      <div className="flex w-full gap-2">
        <Button variant="blue" onClick={() => navigate('/algorithm-lab/name')} className="flex-1">
          이전
        </Button>
        <Button variant="blue" onClick={() => navigate('/algorithm-lab/method')} className="flex-1">
          다음
        </Button>
      </div>
    </div>
  );
};
