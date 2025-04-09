import { ChartBarIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { HelpBadge } from '@/components/common/help-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimpleDailyChart } from '@/components/ui/simple-daily-chart';
import { SimpleMinuteChart } from '@/components/ui/simple-minute-chart';
import { TermTooltip } from '@/components/ui/term-tooltip';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAlgorithmLabGuard } from '@/hooks/useAlgorithmLabGuard';
import {
  DUMMY_ALGORITHM_LAB_DAILY_CHART_DATA,
  DUMMY_ALGORITHM_LAB_MINUTE_CHART_DATA,
} from '@/mocks/dummy-data';
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

  // 입력값 임시 저장을 위한 상태
  const [increaseValue, setIncreaseValue] = useState<string>('0.1');
  const [decreaseValue, setDecreaseValue] = useState<string>('0.1');
  // 알림 메시지 상태 추가
  const [showAlert, setShowAlert] = useState<boolean>(false);

  // 기존 상태값이 있으면 UI에 반영
  useEffect(() => {
    // 분봉 설정이 있는 경우
    if (
      oneMinuteIncreasePercent !== null &&
      oneMinuteIncreaseAction !== null &&
      oneMinuteDecreasePercent !== null &&
      oneMinuteDecreaseAction !== null
    ) {
      setSelectedTimeframe('oneMinute');
      // 소수점 두 자리로 설정 (blur 시에만 포맷팅되므로 여기선 그대로 표시)
      setIncreaseValue(String(oneMinuteIncreasePercent));
      setDecreaseValue(String(oneMinuteDecreasePercent));
    }
    // 일봉 설정이 있는 경우
    else if (
      dailyIncreasePercent !== null &&
      dailyIncreaseAction !== null &&
      dailyDecreasePercent !== null &&
      dailyDecreaseAction !== null
    ) {
      setSelectedTimeframe('daily');
      // 소수점 두 자리로 설정 (blur 시에만 포맷팅되므로 여기선 그대로 표시)
      setIncreaseValue(String(dailyIncreasePercent));
      setDecreaseValue(String(dailyDecreasePercent));
    }
  }, [
    oneMinuteIncreasePercent,
    oneMinuteIncreaseAction,
    oneMinuteDecreasePercent,
    oneMinuteDecreaseAction,
    dailyIncreasePercent,
    dailyIncreaseAction,
    dailyDecreasePercent,
    dailyDecreaseAction,
  ]);

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
      setIncreaseValue('');
      setDecreaseValue('');
    } else {
      setSelectedTimeframe(timeframe);
      if (timeframe === 'oneMinute') {
        setShortTermMaPeriod(null);
        setLongTermMaPeriod(null);
        setOneMinuteIncreasePercent(0.1);
        setOneMinuteDecreasePercent(0.1);
        setOneMinuteIncreaseAction('BUY');
        setOneMinuteDecreaseAction('SELL');
        setDailyIncreasePercent(null);
        setDailyDecreasePercent(null);
        setDailyIncreaseAction(null);
        setDailyDecreaseAction(null);
        setIncreaseValue('0.1');
        setDecreaseValue('0.1');
      } else {
        setDailyIncreasePercent(0.1);
        setDailyDecreasePercent(0.1);
        setDailyIncreaseAction('BUY');
        setDailyDecreaseAction('SELL');
        setOneMinuteIncreasePercent(null);
        setOneMinuteDecreasePercent(null);
        setOneMinuteIncreaseAction(null);
        setOneMinuteDecreaseAction(null);
        setIncreaseValue('0.1');
        setDecreaseValue('0.1');
      }
    }
  };

  // 숫자 입력 유효성 검사 및 처리
  const handlePercentChange = (e: ChangeEvent<HTMLInputElement>, type: 'increase' | 'decrease') => {
    const value = e.target.value;

    // 입력값 패턴 검사: 숫자만, 또는 소수점 포함 숫자만 (소수점 두 자리까지만), 또는 빈 문자열
    if (/^$|^([0-9]{1,2})$|^([0-9]{1,2}\.[0-9]{0,2})$/.test(value)) {
      // 중간 입력 (예: '2', '2.', '2.3')은 그대로 허용하고 표시
      if (type === 'increase') {
        setIncreaseValue(value);
      } else {
        setDecreaseValue(value);
      }

      // 숫자로 변환하여 범위 체크 및 저장 (완전한 숫자인 경우만)
      if (value && !/\.$/.test(value)) {
        // 소수점으로 끝나지 않는 경우에만 숫자로 변환
        const numValue = parseFloat(value);

        // 값이 유효 범위(0.1~30) 내에 있는 경우에만 저장
        if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 30) {
          if (type === 'increase') {
            if (selectedTimeframe === 'oneMinute') {
              setOneMinuteIncreasePercent(numValue);
            } else {
              setDailyIncreasePercent(numValue);
            }
          } else {
            if (selectedTimeframe === 'oneMinute') {
              setOneMinuteDecreasePercent(numValue);
            } else {
              setDailyDecreasePercent(numValue);
            }
          }
        }
      }
    }
  };

  // 포커스를 잃었을 때 값을 포맷하고 유효성 검사
  const handleBlur = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      const value = increaseValue;
      let numValue = value ? parseFloat(value) : 0;

      // 빈 값이거나 유효하지 않은 값인 경우 기본값 0.10 사용
      if (value === '' || isNaN(numValue) || numValue < 0.1) {
        numValue = 0.1;
      } else if (numValue > 30) {
        numValue = 30;
      }

      // 소수점 두 자리로 포맷팅
      const formattedValue = numValue.toFixed(2);
      setIncreaseValue(formattedValue);

      if (selectedTimeframe === 'oneMinute') {
        setOneMinuteIncreasePercent(numValue);
      } else {
        setDailyIncreasePercent(numValue);
      }
    } else {
      const value = decreaseValue;
      let numValue = value ? parseFloat(value) : 0;

      // 빈 값이거나 유효하지 않은 값인 경우 기본값 0.10 사용
      if (value === '' || isNaN(numValue) || numValue < 0.1) {
        numValue = 0.1;
      } else if (numValue > 30) {
        numValue = 30;
      }

      // 소수점 두 자리로 포맷팅
      const formattedValue = numValue.toFixed(2);
      setDecreaseValue(formattedValue);

      if (selectedTimeframe === 'oneMinute') {
        setOneMinuteDecreasePercent(numValue);
      } else {
        setDailyDecreasePercent(numValue);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <h2 className="text-3xl font-bold">시장 반응 설정</h2>
      <div className="flex w-full flex-col gap-2">
        <HelpBadge
          title="시장 변화에 대응하기"
          description="주식 가격 변화에 어떻게 반응할까요?
        여러분의 선택에 따라 다양한 방법으로 반응이 가능합니다."
        />
      </div>
      <div className="flex w-full gap-4">
        <div className="flex w-full flex-col gap-2">
          <p className="text-lg font-bold">시장 변화에 대응하기</p>
          <div className="flex w-full gap-2">
            <Button
              variant="blue"
              onClick={() => handleTimeframeClick('oneMinute')}
              className={`flex-1 flex-col items-center p-4 ${
                selectedTimeframe === 'oneMinute' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/10'
              }`}
            >
              <p className="text-lg font-bold">
                단기 변화에 반응{' '}
                <span className="text-sm font-normal">
                  (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="relative ml-1 mr-1 inline-flex cursor-help items-center">
                        <span className="flex items-center">
                          분봉
                          <QuestionMarkCircleIcon className="ml-1 h-4 w-4 text-white" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="w-auto p-2" side="top">
                        <p className="mb-1 font-semibold">분봉 차트</p>
                        <p className="text-xs">1분 단위로 변화하는 주가 데이터를 표시합니다.</p>
                        <p className="text-xs">단기적인 가격 변동을 분석하는데 유용합니다.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  )
                </span>
              </p>
              <p className="whitespace-normal break-keep text-sm">
                짧은 시간 동안의 급격한 가격 변화에 빠르게 대응합니다.
              </p>
            </Button>
            <Button
              variant="blue"
              onClick={() => handleTimeframeClick('daily')}
              className={`flex-1 flex-col items-center p-4 ${
                selectedTimeframe === 'daily' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/10'
              }`}
            >
              <p className="text-lg font-bold">
                일간 추세에 반응{' '}
                <span className="text-sm font-normal">
                  (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="relative ml-1 mr-1 inline-flex cursor-help items-center">
                        <span className="flex items-center">
                          일봉
                          <QuestionMarkCircleIcon className="ml-1 h-4 w-4 text-white" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="w-auto p-2" side="top">
                        <p className="mb-1 font-semibold">일봉 차트</p>
                        <p className="text-xs">하루 단위로 변화하는 주가 데이터를 표시합니다.</p>
                        <p className="text-xs">장기적인 추세 분석에 유용합니다.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  )
                </span>
              </p>
              <p className="whitespace-normal break-keep text-sm">
                하루 동안의 전체적인 추세를 바탕으로 대응합니다.
              </p>
            </Button>
          </div>
        </div>
      </div>

      {/* 선택된 시간대에 따른 차트 미리보기 */}
      {selectedTimeframe && (
        <div className="w-full animate-fadeIn rounded-lg border border-gray-200 shadow-md">
          <h3 className="mb-1 p-2 text-center text-lg font-semibold">
            {selectedTimeframe === 'oneMinute' ? '분봉' : '일봉'} 차트 예시
          </h3>

          <div className="flex w-full flex-col items-center justify-center p-2">
            {selectedTimeframe === 'oneMinute' ? (
              <SimpleMinuteChart data={DUMMY_ALGORITHM_LAB_MINUTE_CHART_DATA.data} />
            ) : (
              <SimpleDailyChart data={DUMMY_ALGORITHM_LAB_DAILY_CHART_DATA.data} />
            )}
          </div>

          <div className="mb-3 px-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <div className="flex items-center">
                <div className="mr-1 h-3 w-3 rounded-sm bg-red-500"></div>
                <span>상승</span>
              </div>
              <div className="flex items-center">
                <div className="mr-1 h-3 w-3 rounded-sm bg-blue-600"></div>
                <span>하락</span>
              </div>

              {selectedTimeframe === 'daily' && (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex cursor-help items-center">
                        <div className="mr-1 h-3 w-3 rounded-sm bg-[#FFC000]"></div>
                        <span className="flex items-center">
                          단기(5일)선
                          <QuestionMarkCircleIcon className="ml-1 h-4 w-4 text-white" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-2">
                        <p className="mb-1 text-xs font-medium">단기 이동평균선(5일)</p>
                        <p className="text-xs">
                          5일 동안의 주가 평균을 연결한 선입니다. 짧은 기간의 추세를 보여주며, 주가
                          변동에 민감하게 반응합니다.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex cursor-help items-center">
                        <div className="mr-1 h-3 w-3 rounded-sm bg-[#9BD45E]"></div>
                        <span className="flex items-center">
                          장기(20일)선
                          <QuestionMarkCircleIcon className="ml-1 h-4 w-4 text-white" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-2">
                        <p className="mb-1 text-xs font-medium">장기 이동평균선(20일)</p>
                        <p className="text-xs">
                          20일 동안의 주가 평균을 연결한 선입니다. 장기적인 추세를 보여주며, 주가의
                          전체적인 방향성을 파악하는 데 도움이 됩니다.
                        </p>
                        <p className="mt-1 text-xs">
                          <span className="font-medium">골든크로스:</span> 단기선이 장기선을 상향
                          돌파할 때 구매 신호
                        </p>
                        <p className="text-xs">
                          <span className="font-medium">데드크로스:</span> 단기선이 장기선을 하향
                          돌파할 때 판매 신호
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md space-y-6">
        <div className="mb-6 w-full rounded-2xl border border-btn-primary-inactive-color bg-modal-background-color p-4 shadow-sm">
          <div>
            <p className="flex items-center text-lg font-bold text-primary-color">
              <ChartBarIcon className="mr-1 h-5 w-5" />
              반응 강도란?
            </p>
            <p className="text-sm">
              주가 변동에 <b className="text-primary-color">얼마나 강하게 반응할지</b>를 결정하는
              비율입니다.
            </p>
            <div className="my-2 rounded-lg p-2">
              <p className="text-sm">
                예를 들어, 상승 시 반응 강도가 2%라면
                <br />
                <b className="text-primary-color">
                  주가가 2% 이상 상승할 때 설정한 행동(구매/판매)을 실행
                </b>
                합니다.
              </p>
            </div>
            <div className="rounded-lg p-2">
              <p className="text-sm">
                반응 강도가 높을수록 <b className="text-primary-color">큰 변동에만 반응</b>하게
                되고,
                <br />
                낮을수록 <b className="text-primary-color">작은 변동에도 민감하게 반응</b>합니다.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm ">
                상승 시 <TermTooltip term="반응 강도">반응 강도</TermTooltip>
              </p>
              <span className="text-sm font-bold text-primary-color">
                {selectedTimeframe ? `(${increaseValue}%)` : ''}
              </span>
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
                    : 'bg-btn-blue-color/10'
                }
                disabled={!selectedTimeframe}
              >
                구매
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
                    : 'bg-btn-blue-color/10'
                }
                disabled={!selectedTimeframe}
              >
                판매
              </Button>
            </div>
          </div>
          <div className="relative">
            <Input
              type="text"
              inputMode="decimal"
              value={increaseValue}
              onChange={(e) => handlePercentChange(e, 'increase')}
              onBlur={() => handleBlur('increase')}
              disabled={!selectedTimeframe}
              className={`h-10 ${!selectedTimeframe ? 'cursor-not-allowed opacity-50' : ''}`}
              min={0.1}
              max={30}
              step={0.01}
              placeholder="0.10 ~ 30.00 사이 값 입력"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</div>
          </div>
          <p className="text-xs text-gray-500">0.10 ~ 30.00 사이의 값만 입력 가능합니다.</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm">
                하락 시 <TermTooltip term="반응 강도">반응 강도</TermTooltip>
              </p>
              <span className="text-sm font-bold text-primary-color">
                {selectedTimeframe ? `(${decreaseValue}%)` : ''}
              </span>
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
                    : 'bg-btn-blue-color/10'
                }
                disabled={!selectedTimeframe}
              >
                구매
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
                    : 'bg-btn-blue-color/10'
                }
                disabled={!selectedTimeframe}
              >
                판매
              </Button>
            </div>
          </div>
          <div className="relative">
            <Input
              type="text"
              inputMode="decimal"
              value={decreaseValue}
              onChange={(e) => handlePercentChange(e, 'decrease')}
              onBlur={() => handleBlur('decrease')}
              disabled={!selectedTimeframe}
              className={`h-10 ${!selectedTimeframe ? 'cursor-not-allowed opacity-50' : ''}`}
              min={0.1}
              max={30}
              step={0.01}
              placeholder="0.10 ~ 30.00 사이 값 입력"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</div>
          </div>
          <p className="text-xs text-gray-500">0.10 ~ 30.00 사이의 값만 입력 가능합니다.</p>
        </div>
      </div>
      <div className="w-full overflow-hidden">
        {selectedTimeframe === 'daily' && (
          <div className="flex animate-fadeIn flex-col gap-4">
            <p className="mt-5 text-lg font-bold">
              <TermTooltip term="이동평균선">이동평균선</TermTooltip> 설정
            </p>
            <HelpBadge
              title="주식의 장기적인 움직임을 분석할까요?"
              description={
                <>
                  주식의
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="relative ml-1 mr-2 inline-flex cursor-help items-center">
                        <span className="flex items-center">
                          장기적인 움직임
                          <QuestionMarkCircleIcon className="ml-1 h-4 w-4 text-white" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="w-auto bg-white p-0" side="top">
                        <img
                          src="/stock/golden_death_cross.png"
                          alt="골든크로스 이미지"
                          className="w-96 rounded-md"
                        />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  을 분석할 수 있는 이동평균선 사용이 가능합니다. 해당 기능은 주가의 추세를
                  파악하는데 도움이 됩니다.
                  <br />
                  <br />
                  <span className="font-bold text-primary-color">골든크로스</span>(단기선이 장기선을
                  상향 돌파할 때 구매 신호)
                  <br />
                  <span className="font-bold text-primary-color">데드크로스</span>(단기선이 장기선을
                  하향 돌파할 때 판매 신호)
                  <br />
                  신호로 활용 할 수 있습니다.
                </>
              }
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
                    : 'bg-btn-blue-color/10'
                }
              >
                {shortTermMaPeriod === 5 && longTermMaPeriod === 20 ? '사용중' : '사용하기'}
              </Button>
              <p className="text-base text-btn-primary-active-color">
                {shortTermMaPeriod === 5 && longTermMaPeriod === 20
                  ? '이동평균선이 적용되었습니다.'
                  : '버튼 클릭시 이동평균선 사용이 가능합니다.'}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex w-full gap-2">
        <Button variant="blue" onClick={() => navigate('/algorithm-lab/method')} className="flex-1">
          이전
        </Button>
        <Button
          variant="blue"
          onClick={() => {
            if (selectedTimeframe) {
              navigate('/algorithm-lab/confirm');
            }
          }}
          className="flex-1"
          disabled={!selectedTimeframe}
        >
          다음
        </Button>
      </div>
      {showAlert && (
        <div className="animate-slideUp fixed bottom-4 left-1/2 -translate-x-1/2 transform rounded-md bg-red-500 p-3 shadow-lg">
          <p className="text-white">시간 프레임을 선택해주세요!</p>
        </div>
      )}
    </div>
  );
};
