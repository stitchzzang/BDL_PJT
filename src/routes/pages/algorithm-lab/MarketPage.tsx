import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { HelpBadge } from '@/components/common/help-badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAlgorithmLabGuard } from '@/hooks/useAlgorithmLabGuard';
import { InvalidAccessPage } from '@/routes/pages/algorithm-lab/InvalidAccessPage';
import { useAlgorithmLabStore } from '@/store/useAlgorithmLabStore';

export const MarketPage = () => {
  const isValidAccess = useAlgorithmLabGuard('market');
  const navigate = useNavigate();
  const {
    oneMinuteIncreasePercent,
    oneMinuteDecreasePercent,
    oneMinuteIncreaseAction,
    oneMinuteDecreaseAction,
    dailyIncreasePercent,
    dailyDecreasePercent,
    dailyIncreaseAction,
    dailyDecreaseAction,
    setOneMinuteIncreasePercent,
    setOneMinuteDecreasePercent,
    setOneMinuteIncreaseAction,
    setOneMinuteDecreaseAction,
    setDailyIncreasePercent,
    setDailyDecreasePercent,
    setDailyIncreaseAction,
    setDailyDecreaseAction,
    setShortTermMaPeriod,
    setLongTermMaPeriod,
    shortTermMaPeriod,
    longTermMaPeriod,
  } = useAlgorithmLabStore();

  const [selectedTimeframe, setSelectedTimeframe] = useState<'oneMinute' | 'daily' | null>(null);

  if (!isValidAccess) {
    return <InvalidAccessPage />;
  }

  const handleTimeframeClick = (timeframe: 'oneMinute' | 'daily') => {
    if (selectedTimeframe === timeframe) {
      setSelectedTimeframe(null);
      setOneMinuteIncreasePercent(null);
      setOneMinuteDecreasePercent(null);
      setOneMinuteIncreaseAction(null);
      setOneMinuteDecreaseAction(null);
      setDailyIncreasePercent(null);
      setDailyDecreasePercent(null);
      setDailyIncreaseAction(null);
      setDailyDecreaseAction(null);
      setShortTermMaPeriod(null);
      setLongTermMaPeriod(null);
    } else {
      setSelectedTimeframe(timeframe);
      if (timeframe === 'oneMinute') {
        setShortTermMaPeriod(null);
        setLongTermMaPeriod(null);
        setOneMinuteIncreasePercent(1);
        setOneMinuteDecreasePercent(1);
        setOneMinuteIncreaseAction('BUY');
        setOneMinuteDecreaseAction('SELL');
        setDailyIncreasePercent(null);
        setDailyDecreasePercent(null);
        setDailyIncreaseAction(null);
        setDailyDecreaseAction(null);
      } else {
        setDailyIncreasePercent(1);
        setDailyDecreasePercent(1);
        setDailyIncreaseAction('BUY');
        setDailyDecreaseAction('SELL');
        setOneMinuteIncreasePercent(null);
        setOneMinuteDecreasePercent(null);
        setOneMinuteIncreaseAction(null);
        setOneMinuteDecreaseAction(null);
      }
    }
  };

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
          onClick={() => handleTimeframeClick('oneMinute')}
          className={`flex-1 flex-col items-center p-4 ${
            selectedTimeframe === 'oneMinute' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/20'
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
          onClick={() => handleTimeframeClick('daily')}
          className={`flex-1 flex-col items-center p-4 ${
            selectedTimeframe === 'daily' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/20'
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
              {selectedTimeframe && (
                <span className="text-sm font-bold text-primary-color">
                  (
                  {selectedTimeframe === 'oneMinute'
                    ? (oneMinuteIncreasePercent ?? 1)
                    : (dailyIncreasePercent ?? 1)}
                  %)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="blue"
                size="sm"
                onClick={() =>
                  selectedTimeframe === 'oneMinute'
                    ? setOneMinuteIncreaseAction('BUY')
                    : setDailyIncreaseAction('BUY')
                }
                className={
                  (selectedTimeframe === 'oneMinute'
                    ? oneMinuteIncreaseAction
                    : dailyIncreaseAction) === 'BUY'
                    ? 'bg-btn-blue-color'
                    : 'bg-btn-blue-color/20'
                }
                disabled={!selectedTimeframe}
              >
                매수
              </Button>
              <Button
                variant="blue"
                size="sm"
                onClick={() =>
                  selectedTimeframe === 'oneMinute'
                    ? setOneMinuteIncreaseAction('SELL')
                    : setDailyIncreaseAction('SELL')
                }
                className={
                  (selectedTimeframe === 'oneMinute'
                    ? oneMinuteIncreaseAction
                    : dailyIncreaseAction) === 'SELL'
                    ? 'bg-btn-blue-color'
                    : 'bg-btn-blue-color/20'
                }
                disabled={!selectedTimeframe}
              >
                매도
              </Button>
            </div>
          </div>
          <Slider
            value={[
              selectedTimeframe === 'oneMinute'
                ? (oneMinuteIncreasePercent ?? 1)
                : selectedTimeframe === 'daily'
                  ? (dailyIncreasePercent ?? 1)
                  : 1,
            ]}
            onValueChange={(value) =>
              selectedTimeframe === 'oneMinute'
                ? setOneMinuteIncreasePercent(value[0])
                : setDailyIncreasePercent(value[0])
            }
            min={1}
            max={30}
            step={0.5}
            disabled={!selectedTimeframe}
            className={!selectedTimeframe ? 'cursor-not-allowed opacity-50' : ''}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">하락 시 반응 강도</p>
              {selectedTimeframe && (
                <span className="text-sm font-bold text-primary-color">
                  (
                  {selectedTimeframe === 'oneMinute'
                    ? (oneMinuteDecreasePercent ?? 1)
                    : (dailyDecreasePercent ?? 1)}
                  %)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="blue"
                size="sm"
                onClick={() =>
                  selectedTimeframe === 'oneMinute'
                    ? setOneMinuteDecreaseAction('BUY')
                    : setDailyDecreaseAction('BUY')
                }
                className={
                  (selectedTimeframe === 'oneMinute'
                    ? oneMinuteDecreaseAction
                    : dailyDecreaseAction) === 'BUY'
                    ? 'bg-btn-blue-color'
                    : 'bg-btn-blue-color/20'
                }
                disabled={!selectedTimeframe}
              >
                매수
              </Button>
              <Button
                variant="blue"
                size="sm"
                onClick={() =>
                  selectedTimeframe === 'oneMinute'
                    ? setOneMinuteDecreaseAction('SELL')
                    : setDailyDecreaseAction('SELL')
                }
                className={
                  (selectedTimeframe === 'oneMinute'
                    ? oneMinuteDecreaseAction
                    : dailyDecreaseAction) === 'SELL'
                    ? 'bg-btn-blue-color'
                    : 'bg-btn-blue-color/20'
                }
                disabled={!selectedTimeframe}
              >
                매도
              </Button>
            </div>
          </div>
          <Slider
            value={[
              selectedTimeframe === 'oneMinute'
                ? (oneMinuteDecreasePercent ?? 1)
                : selectedTimeframe === 'daily'
                  ? (dailyDecreasePercent ?? 1)
                  : 1,
            ]}
            onValueChange={(value) =>
              selectedTimeframe === 'oneMinute'
                ? setOneMinuteDecreasePercent(value[0])
                : setDailyDecreasePercent(value[0])
            }
            min={1}
            max={30}
            step={0.5}
            disabled={!selectedTimeframe}
            className={!selectedTimeframe ? 'cursor-not-allowed opacity-50' : ''}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <HelpBadge
          title="주식의 장기적인 움직임을 분석할까요?"
          description={`주식의 장기적인 움직임을 분석할 이동평균선 사용이 가능합니다.
                      해당 기능은 주가의 추세를 파악하는데 도움이 됩니다.

                      단기선이 장기선을 상향 돌파할 때 매수 신호, 하양 돌파할 때 매도 신호로 활용 할 수 있습니다.`}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="blue"
            onClick={() => {
              if (shortTermMaPeriod === 5 && longTermMaPeriod === 20) {
                setShortTermMaPeriod(null);
                setLongTermMaPeriod(null);
              } else {
                setShortTermMaPeriod(5);
                setLongTermMaPeriod(20);
              }
            }}
            className={
              shortTermMaPeriod === 5 && longTermMaPeriod === 20
                ? 'bg-btn-blue-color'
                : 'bg-btn-blue-color/20'
            }
            disabled={!selectedTimeframe || selectedTimeframe === 'oneMinute'}
          >
            {shortTermMaPeriod === 5 && longTermMaPeriod === 20 ? '사용중' : '사용하기'}
          </Button>
          <p className="text-base text-btn-primary-active-color">
            {!selectedTimeframe || selectedTimeframe === 'oneMinute' ? (
              <>
                옵션을
                <span className="font-semibold text-primary-color"> 일간 추세에 반응</span>으로
                선택해주세요.
              </>
            ) : shortTermMaPeriod === 5 && longTermMaPeriod === 20 ? (
              '이동평균선이 적용되었습니다.'
            ) : (
              '버튼 클릭시 이동평균선 사용이 가능합니다.'
            )}
          </p>
        </div>
      </div>
      <div className="flex w-full gap-2">
        <Button variant="blue" onClick={() => navigate('/algorithm-lab/method')} className="flex-1">
          이전
        </Button>
        <Button
          variant="blue"
          onClick={() => navigate('/algorithm-lab/confirm')}
          className="flex-1"
        >
          다음
        </Button>
      </div>
    </div>
  );
};
