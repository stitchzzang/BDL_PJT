import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid';
import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';

import StableMotion from '@/assets/lottie/stable-animation.json';
import { HelpBadge } from '@/components/common/help-badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAlgorithmLabGuard } from '@/hooks/useAlgorithmLabGuard';
import { InvalidAccessPage } from '@/routes/pages/algorithm-lab/InvalidAccessPage';
import { useAlgorithmLabStore } from '@/store/useAlgorithmLabStore';

export const StylePage = () => {
  const isValidAccess = useAlgorithmLabGuard('style');
  const navigate = useNavigate();
  const {
    investmentStyle,
    setInvestmentStyle,
    profitPercentToSell,
    lossPercentToSell,
    setProfitPercentToSell,
    setLossPercentToSell,
  } = useAlgorithmLabStore();

  if (!isValidAccess) {
    return <InvalidAccessPage />;
  }

  // 해당 범위 내에 있는지 확인
  const isConservativeValid =
    profitPercentToSell >= 3 &&
    profitPercentToSell <= 5 &&
    lossPercentToSell >= 1 &&
    lossPercentToSell <= 2;
  const isBalancedValid =
    profitPercentToSell >= 8 &&
    profitPercentToSell <= 12 &&
    lossPercentToSell >= 3 &&
    lossPercentToSell <= 5;
  const isAggressiveValid =
    profitPercentToSell >= 15 &&
    profitPercentToSell <= 25 &&
    lossPercentToSell >= 7 &&
    lossPercentToSell <= 10;

  // 투자 스타일 클릭 시 이벤트 핸들러
  const handleStyleClick = (
    style: 'conservative' | 'balanced' | 'aggressive',
    profitValue: number,
    lossValue: number,
  ) => {
    setInvestmentStyle(style);
    setProfitPercentToSell(profitValue);
    setLossPercentToSell(lossValue);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold">투자 스타일 선택</h2>
        <div>
          <Lottie
            animationData={StableMotion}
            loop={true}
            autoplay={true}
            style={{ height: 170, width: 170 }}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice',
            }}
          />
        </div>
      </div>
      <HelpBadge
        title="어떤 투자 스타일을 선호하시나요?"
        description="3가지 선택지 중 가장 선호하는 투자 스타일을 선택하거나 바를 드래그하여 원하는 값을 선택해주세요."
      />

      <div className="w-full rounded-2xl border border-btn-primary-inactive-color  bg-modal-background-color p-4 shadow-sm">
        <div>
          <p className="flex items-center text-lg font-bold text-primary-color">
            <ArrowTrendingUpIcon className="mr-1 h-5 w-5" />
            이익률이란?
          </p>
          <p className="text-sm">
            주식 가격이 <b className="text-primary-color">얼마나 올라갔을 때 팔지</b>를 결정하는
            비율입니다.
          </p>
          <div className="my-2 rounded-lg p-2">
            <p className="text-sm">
              예를 들어, 이익률이 10%라면 주식을 산 가격보다
              <br />
              <b className="text-primary-color">10% 더 올라갔을 때 자동으로 팔게</b> 됩니다.
            </p>
          </div>
          <div className="rounded-lg p-2">
            <p className="text-sm">
              이익률이 높을수록 <b className="text-primary-color">더 큰 수익을 기대</b>할 수 있지만,
              <br />
              <b className="text-primary-color">가격이 떨어질 위험</b>도 있습니다.
            </p>
          </div>
        </div>

        <hr className="my-4 border-t border-btn-primary-inactive-color" />

        <div>
          <p className="flex items-center text-lg font-bold text-primary-color">
            <ArrowTrendingDownIcon className="mr-1 h-5 w-5" />
            손절매란?
          </p>
          <p className="text-sm">
            주식 가격이{' '}
            <b className="text-primary-color">얼마나 내려갔을 때 손해를 감수하고 팔지</b>를<br />
            결정하는 비율입니다.
          </p>
          <div className="my-2 rounded-lg p-2">
            <p className="text-sm">
              예를 들어, 손절매가 5%라면 주식을 산 가격보다
              <br />
              <b className="text-primary-color">5% 더 내려갔을 때 자동으로 팔게</b> 됩니다.
            </p>
          </div>
          <div className="rounded-lg p-2">
            <p className="text-sm">
              이는 <b className="text-primary-color">더 큰 손실을 방지하기 위한 안전장치</b>입니다.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-4">
        <Button
          variant="green"
          onClick={() => handleStyleClick('conservative', 4, 1.5)}
          className={`flex w-full flex-col items-start p-4 transition-all duration-300 ${
            isConservativeValid || investmentStyle === 'conservative'
              ? 'bg-btn-green-color'
              : 'bg-btn-green-color/10'
          }`}
        >
          <p className="font-bold">보수적(안정적 중시형)</p>
          <p className="whitespace-normal text-sm">
            작은 이익을 안정적으로 추구하고 손실은 최소화합니다.
          </p>
          <p
            className={`mt-1 text-sm font-bold ${
              isConservativeValid || investmentStyle === 'conservative'
                ? 'text-white'
                : 'text-btn-green-color'
            }`}
          >
            이익률: 3~5%, 손절매: 1~2%
          </p>
        </Button>
        <Button
          variant="yellow"
          onClick={() => handleStyleClick('balanced', 10, 4)}
          className={`flex w-full flex-col items-start p-4 transition-all duration-300 ${
            isBalancedValid || investmentStyle === 'balanced'
              ? 'bg-btn-yellow-color'
              : 'bg-btn-yellow-color/10'
          }`}
        >
          <p className="font-bold">균형적(중립형)</p>
          <p className="whitespace-normal text-sm">이익과 위험 사이의 균형을 유지합니다.</p>
          <p
            className={`mt-1 text-sm font-bold ${
              isBalancedValid || investmentStyle === 'balanced'
                ? 'text-white'
                : 'text-btn-yellow-color'
            }`}
          >
            이익률: 8~12%, 손절매: 3~5%
          </p>
        </Button>
        <Button
          variant="red"
          onClick={() => handleStyleClick('aggressive', 20, 8.5)}
          className={`flex w-full flex-col items-start p-4 transition-all duration-300 ${
            isAggressiveValid || investmentStyle === 'aggressive'
              ? 'bg-btn-red-color'
              : 'bg-btn-red-color/10'
          }`}
        >
          <p className="font-bold">공격적(수익 지향형)</p>
          <p className="whitespace-normal text-sm">더 큰 이익을 위해 더 큰 위험을 감수합니다.</p>
          <p
            className={`mt-1 text-sm font-bold ${
              isAggressiveValid || investmentStyle === 'aggressive'
                ? 'text-white'
                : 'text-btn-red-color'
            }`}
          >
            이익률: 15~25%, 손절매: 7~10%
          </p>
        </Button>
      </div>
      <div className="flex w-full max-w-md flex-col gap-2">
        <p className="text-sm font-bold text-border-color">
          이익률 ({profitPercentToSell.toFixed(1)}%)
        </p>
        <Slider
          value={[profitPercentToSell]}
          onValueChange={(value) => {
            setProfitPercentToSell(value[0]);
            setInvestmentStyle(null);
          }}
          min={1}
          max={30}
          step={0.5}
        />
        <p className="text-sm font-semibold text-border-color">
          손절매 ({lossPercentToSell.toFixed(1)}%)
        </p>
        <Slider
          value={[lossPercentToSell]}
          onValueChange={(value) => {
            setLossPercentToSell(value[0]);
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
