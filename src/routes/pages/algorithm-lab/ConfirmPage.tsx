import { useNavigate } from 'react-router-dom';

import { useCreateAlgorithm } from '@/api/algorithm.api';
import { Button } from '@/components/ui/button';
import { useAlgorithmLabGuard } from '@/hooks/useAlgorithmLabGuard';
import { InvalidAccessPage } from '@/routes/pages/algorithm-lab/InvalidAccessPage';
import { useAlgorithmLabStore } from '@/store/useAlgorithmLabStore';

export const ConfirmPage = () => {
  const isValidAccess = useAlgorithmLabGuard('confirm');
  const navigate = useNavigate();
  const createAlgorithm = useCreateAlgorithm();
  const {
    algorithmName,
    investmentStyle,
    investmentMethod,
    investmentAmount,
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
  } = useAlgorithmLabStore();

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
      case 'ratio':
        return '자산비율 투자';
      case 'fixed':
        return '고정금액 투자';
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
      memberId: '1',
      algorithm: {
        algorithmName,
        entryMethod: 'ONCE',
        exitMethod: 'ONCE',
        entryInvestmentMethod: investmentMethod === 'fixed' ? 'FIXED_AMOUNT' : 'FIXED_PERCENTAGE',
        entryFixedAmount: investmentMethod === 'fixed' ? investmentAmount : undefined,
        entryFixedPercentage: investmentMethod === 'ratio' ? investmentAmount : 100,
        exitInvestmentMethod: undefined,
        exitFixedAmount: undefined,
        exitFixedPercentage: undefined,
        profitPercentToSell: profitPercentToSell ?? undefined,
        lossPercentToSell: lossPercentToSell ?? undefined,
        oneMinuteIncreasePercent: oneMinuteIncreasePercent ?? undefined,
        oneMinuteDecreasePercent: oneMinuteDecreasePercent ?? undefined,
        oneMinuteIncreaseAction: oneMinuteIncreaseAction ?? undefined,
        oneMinuteDecreaseAction: oneMinuteDecreaseAction ?? undefined,
        dailyIncreasePercent: dailyIncreasePercent ?? undefined,
        dailyDecreasePercent: dailyDecreasePercent ?? undefined,
        dailyIncreaseAction: dailyIncreaseAction ?? undefined,
        dailyDecreaseAction: dailyDecreaseAction ?? undefined,
        shortTermMaPeriod: shortTermMaPeriod ?? undefined,
        longTermMaPeriod: longTermMaPeriod ?? undefined,
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
            이익 실현 :
            <span className="text-[18px] font-bold text-btn-blue-color">
              {' '}
              {profitPercentToSell}%
            </span>
          </p>
          <p>
            손절매 :
            <span className="text-[18px] font-bold text-btn-blue-color"> {lossPercentToSell}%</span>
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-text-inactive-3-color">투자 방식</h3>
          <p className="font-light text-border-color">
            {investmentMethod && getMethodText(investmentMethod)} :{' '}
            <span className="text-[18px] font-bold text-btn-blue-color">
              {investmentAmount.toLocaleString()}원
            </span>
          </p>
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
                  <span className="text-border-color">상승 시 반응 강도 : </span>
                  <span className="font-medium">{oneMinuteIncreasePercent}%</span>
                  <span className="text-border-color"> (</span>
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
                  <span className="text-border-color">하락 시 반응 강도 : </span>
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
                  <span className="text-border-color">상승 시 반응 강도 : </span>
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
                  <span className="text-border-color">하락 시 반응 강도 : </span>
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
            <p>단기 이동평균선: {shortTermMaPeriod}일</p>
            <p>장기 이동평균선: {longTermMaPeriod}일</p>
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
