import { useNavigate } from 'react-router-dom';

import { HelpBadge } from '@/components/common/help-badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAlgorithmLabGuard } from '@/hooks/useAlgorithmLabGuard';
import { InvalidAccessPage } from '@/routes/pages/algorithmLab/InvalidAccessPage';
import { useAlgorithmLabStore } from '@/store/useAlgorithmLabStore';

export const MarketPage = () => {
  const isValidAccess = useAlgorithmLabGuard('market');
  const navigate = useNavigate();
  const {
    marketResponse,
    riseResponse,
    fallResponse,
    riseAction,
    fallAction,
    setMarketResponse,
    setRiseResponse,
    setFallResponse,
    setRiseAction,
    setFallAction,
  } = useAlgorithmLabStore();

  if (!isValidAccess) {
    return <InvalidAccessPage />;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <h2 className="text-3xl font-bold">시장 반응 설정</h2>
      <HelpBadge
        title="시장 변화에 대응하기"
        description="주식 가격 변화에 어떻게 반응할까요?
        여러분의 선택에 따라 다양한 방법으로 반응이 가능합니다."
      />
      <p className="w-full text-left text-lg font-bold">옵션 중 하나를 선택해주세요.</p>
      <div className="flex w-full gap-4">
        <Button
          variant="blue"
          onClick={() => setMarketResponse('shortTerm')}
          className={`flex-1 flex-col items-center p-4 ${
            marketResponse === 'shortTerm' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/20'
          }`}
        >
          <p className="text-lg font-bold">
            단기 변화에 반응 <span className="text-sm font-normal">(분봉)</span>
          </p>
          <p className="whitespace-normal break-keep text-sm">
            짧은 시간 동안의 급격한 가격 변화에 빠르게 대응합니다.
          </p>
        </Button>
        <Button
          variant="blue"
          onClick={() => setMarketResponse('monthlyTrend')}
          className={`flex-1 flex-col items-center p-4 ${
            marketResponse === 'monthlyTrend' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/20'
          }`}
        >
          <p className="text-lg font-bold">
            일간 추세에 반응 <span className="text-sm font-normal">(일봉)</span>
          </p>
          <p className="whitespace-normal break-keep text-sm">
            하루 동안의 전체적인 추세를 바탕으로 대응합니다.
          </p>
        </Button>
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col gap-2">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">상승 시 반응 강도</p>
              <span className="text-sm font-bold text-primary-color">({riseResponse}%)</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="blue"
                size="sm"
                onClick={() => setRiseAction('buy')}
                className={riseAction === 'buy' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/20'}
              >
                매수
              </Button>
              <Button
                variant="blue"
                size="sm"
                onClick={() => setRiseAction('sell')}
                className={riseAction === 'sell' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/20'}
              >
                매도
              </Button>
            </div>
          </div>
          <Slider
            value={[riseResponse]}
            onValueChange={(value) => setRiseResponse(value[0])}
            min={1}
            max={30}
            step={0.5}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">하락 시 반응 강도</p>
              <span className="text-sm font-bold text-primary-color">({fallResponse}%)</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="blue"
                size="sm"
                onClick={() => setFallAction('buy')}
                className={fallAction === 'buy' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/20'}
              >
                매수
              </Button>
              <Button
                variant="blue"
                size="sm"
                onClick={() => setFallAction('sell')}
                className={fallAction === 'sell' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/20'}
              >
                매도
              </Button>
            </div>
          </div>
          <Slider
            value={[fallResponse]}
            onValueChange={(value) => setFallResponse(value[0])}
            min={1}
            max={30}
            step={0.5}
          />
        </div>
      </div>
      <div className="flex w-full gap-2">
        <Button variant="blue" onClick={() => navigate('/algorithm-lab/method')} className="flex-1">
          이전
        </Button>
        <Button
          variant="blue"
          onClick={() => navigate('/algorithm-lab/confirm')}
          disabled={!marketResponse}
          className="flex-1 disabled:cursor-not-allowed"
        >
          다음
        </Button>
      </div>
    </div>
  );
};
