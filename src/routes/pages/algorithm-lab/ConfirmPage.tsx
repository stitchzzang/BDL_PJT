import { useNavigate } from 'react-router-dom';

import { useCreateAlgorithm } from '@/api/algorithm.api';
import { Button } from '@/components/ui/button';
import { TermTooltip } from '@/components/ui/TermTooltip';
import { useAlgorithmLabGuard } from '@/hooks/useAlgorithmLabGuard';
import { InvalidAccessPage } from '@/routes/pages/algorithm-lab/InvalidAccessPage';
import { useAlgorithmLabStore } from '@/store/useAlgorithmLabStore';
import { useAuthStore } from '@/store/useAuthStore';

export const ConfirmPage = () => {
  const isValidAccess = useAlgorithmLabGuard('confirm');
  const navigate = useNavigate();
  const createAlgorithm = useCreateAlgorithm();
  const {
    algorithmName,
    investmentStyle,
    profitPercentToSell,
    lossPercentToSell,
    oneMinuteIncreasePercent,
    oneMinuteDecreasePercent,
    oneMinuteIncreaseAction,
    oneMinuteDecreaseAction,
    dailyIncreasePercent,
    dailyDecreasePercent,
    dailyIncreaseAction,
    dailyDecreaseAction,
    shortTermMaPeriod,
    longTermMaPeriod,
    entryMethod,
    entryInvestmentMethod,
    entryFixedAmount,
    entryFixedPercentage,
    exitMethod,
    exitInvestmentMethod,
    exitFixedAmount,
    exitFixedPercentage,
    isFee,
  } = useAlgorithmLabStore();
  const { userData } = useAuthStore();

  if (!isValidAccess) {
    return <InvalidAccessPage />;
  }

  const getStyleText = (style: string) => {
    switch (style) {
      case 'conservative':
        return '보수적';
      case 'balanced':
        return '균형적';
      case 'aggressive':
        return '공격적';
      default:
        return '';
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'ONCE':
        return '한번에';
      case 'DIVIDE':
        return '나누어서';
      default:
        return '';
    }
  };

  const getInvestmentMethodText = (method: string) => {
    switch (method) {
      case 'FIXED_AMOUNT':
        return '고정 금액';
      case 'FIXED_PERCENTAGE':
        return '고정 비율';
      default:
        return '';
    }
  };

  const getTimeframeText = () => {
    if (oneMinuteIncreasePercent || oneMinuteDecreasePercent) {
      return '단기 변화에 반응 (분봉)';
    }
    if (dailyIncreasePercent || dailyDecreasePercent) {
      return '일간 추세에 반응 (일봉)';
    }
    return '';
  };

  const handleComplete = () => {
    createAlgorithm.mutate({
      memberId: userData.memberId?.toString() || '',
      algorithm: {
        algorithmName,
        entryMethod: entryMethod ?? 'ONCE',
        exitMethod: exitMethod ?? 'ONCE',
        entryInvestmentMethod: entryInvestmentMethod ?? 'FIXED_PERCENTAGE',
        entryFixedAmount,
        entryFixedPercentage,
        exitInvestmentMethod: exitInvestmentMethod ?? 'FIXED_PERCENTAGE',
        exitFixedAmount,
        exitFixedPercentage,
        profitPercentToSell,
        lossPercentToSell,
        oneMinuteIncreasePercent,
        oneMinuteDecreasePercent,
        oneMinuteIncreaseAction,
        oneMinuteDecreaseAction,
        dailyIncreasePercent,
        dailyDecreasePercent,
        dailyIncreaseAction,
        dailyDecreaseAction,
        shortTermMaPeriod,
        longTermMaPeriod,
        isFee,
      },
    });
    navigate('/member/algorithm', { replace: true });
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
      <h2 className="text-3xl font-bold">알고리즘 확인</h2>
      <div className="w-full space-y-6 rounded-lg border border-btn-primary-inactive-color bg-modal-background-color p-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-text-inactive-3-color">알고리즘 이름</h3>
          <p className="font-bold text-btn-blue-color">{algorithmName}</p>
          <hr className="border border-border-color border-opacity-35" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-text-inactive-3-color">투자 스타일</h3>
          <p>{investmentStyle && getStyleText(investmentStyle)}</p>
          <p>
            <TermTooltip term="이익률">이익률</TermTooltip> :
            <span className="text-[18px] font-bold text-btn-blue-color">
              {' '}
              {profitPercentToSell}%
            </span>
          </p>
          <p>
            <TermTooltip term="손절매">손절매</TermTooltip> :
            <span className="text-[18px] font-bold text-btn-blue-color"> {lossPercentToSell}%</span>
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-text-inactive-3-color">투자 방식</h3>
          <div>
            <p className="font-light">
              <TermTooltip term="진입">진입</TermTooltip> 방식 :{' '}
              {entryMethod && getMethodText(entryMethod)}
              {entryInvestmentMethod && ` (${getInvestmentMethodText(entryInvestmentMethod)})`}
            </p>
            {entryInvestmentMethod === 'FIXED_AMOUNT' && entryFixedAmount && (
              <p className="font-light">
                진입 금액:{' '}
                <span className="text-[18px] font-bold text-btn-blue-color">
                  {entryFixedAmount.toLocaleString()}원
                </span>
              </p>
            )}
            {entryInvestmentMethod === 'FIXED_PERCENTAGE' && entryFixedPercentage && (
              <p className="font-light">
                진입 비율:{' '}
                <span className="text-[18px] font-bold text-btn-blue-color">
                  {entryFixedPercentage}%
                </span>
              </p>
            )}
          </div>
          <div>
            <p className="font-light">
              <TermTooltip term="청산">청산</TermTooltip> 방식 :{' '}
              {exitMethod && getMethodText(exitMethod)}
              {exitInvestmentMethod && ` (${getInvestmentMethodText(exitInvestmentMethod)})`}
            </p>
            {exitInvestmentMethod === 'FIXED_AMOUNT' && exitFixedAmount && (
              <p className="font-light">
                청산 금액:{' '}
                <span className="text-[18px] font-bold text-btn-blue-color">
                  {exitFixedAmount.toLocaleString()}원
                </span>
              </p>
            )}
            {exitInvestmentMethod === 'FIXED_PERCENTAGE' && exitFixedPercentage && (
              <p className="font-light">
                청산 비율:{' '}
                <span className="text-[18px] font-bold text-btn-blue-color">
                  {exitFixedPercentage}%
                </span>
              </p>
            )}
          </div>
          {/* <p className="font-light">
            <TermTooltip term="수수료 포함">수수료 포함</TermTooltip> :{' '}
            <span className="font-bold">{isFee ? '예' : '아니오'}</span>
          </p> */}
        </div>
        {(oneMinuteIncreasePercent ||
          oneMinuteDecreasePercent ||
          dailyIncreasePercent ||
          dailyDecreasePercent) && (
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-text-inactive-3-color">시장 반응</h3>
            <p className="text-base">{getTimeframeText()}</p>
            {(oneMinuteIncreasePercent || oneMinuteDecreasePercent) && (
              <>
                <p>
                  <span>
                    상승 시 <TermTooltip term="반응 강도">반응 강도</TermTooltip> :{' '}
                  </span>
                  <span className="font-medium">{oneMinuteIncreasePercent}%</span>
                  <span> (</span>
                  <span
                    className={
                      oneMinuteIncreaseAction === 'BUY'
                        ? 'font-medium text-red-500'
                        : oneMinuteIncreaseAction === 'SELL'
                          ? 'font-medium text-blue-500'
                          : ''
                    }
                  >
                    {oneMinuteIncreaseAction}
                  </span>
                  <span className="text-border-color">)</span>
                </p>
                <p>
                  <span>
                    하락 시 <TermTooltip term="반응 강도">반응 강도</TermTooltip> :{' '}
                  </span>
                  <span className="font-medium">{oneMinuteDecreasePercent}%</span>
                  <span className="text-border-color"> (</span>
                  <span
                    className={
                      oneMinuteDecreaseAction === 'BUY'
                        ? 'font-medium text-red-500'
                        : oneMinuteDecreaseAction === 'SELL'
                          ? 'font-medium text-blue-500'
                          : ''
                    }
                  >
                    {oneMinuteDecreaseAction}
                  </span>
                  <span className="text-border-color">)</span>
                </p>
              </>
            )}
            {(dailyIncreasePercent || dailyDecreasePercent) && (
              <>
                <p>
                  <span>
                    상승 시 <TermTooltip term="반응 강도">반응 강도</TermTooltip> :{' '}
                  </span>
                  <span className="font-medium">{dailyIncreasePercent}%</span>
                  <span className="text-border-color"> (</span>
                  <span
                    className={
                      dailyIncreaseAction === 'BUY'
                        ? 'font-medium text-red-500'
                        : dailyIncreaseAction === 'SELL'
                          ? 'font-medium text-blue-500'
                          : ''
                    }
                  >
                    {dailyIncreaseAction}
                  </span>
                  <span className="text-border-color">)</span>
                </p>
                <p>
                  <span>
                    하락 시 <TermTooltip term="반응 강도">반응 강도</TermTooltip> :{' '}
                  </span>
                  <span className="font-medium">{dailyDecreasePercent}%</span>
                  <span className="text-border-color"> (</span>
                  <span
                    className={
                      dailyDecreaseAction === 'BUY'
                        ? 'font-medium text-red-500'
                        : dailyDecreaseAction === 'SELL'
                          ? 'font-medium text-blue-500'
                          : ''
                    }
                  >
                    {dailyDecreaseAction}
                  </span>
                  <span className="text-border-color">)</span>
                </p>
              </>
            )}
          </div>
        )}
        {(shortTermMaPeriod || longTermMaPeriod) && (
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-text-inactive-3-color">추세 분석</h3>
            <p>
              <TermTooltip term="이동평균선 사용">이동평균선 사용</TermTooltip> :{' '}
              <span className="font-bold text-btn-blue-color">YES</span>
            </p>
          </div>
        )}
      </div>
      <div className="flex w-full gap-2">
        <Button variant="blue" onClick={() => navigate('/algorithm-lab/market')} className="flex-1">
          이전
        </Button>
        <Button variant="blue" onClick={handleComplete} className="flex-1">
          완료
        </Button>
      </div>
    </div>
  );
};
