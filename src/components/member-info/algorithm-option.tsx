import { Algorithm } from '@/api/types/algorithm';
import { TermTooltip } from '@/components/ui/term-tooltip';
import { addCommasToThousand } from '@/utils/numberFormatter';

type AlgorithmOptionProps = {
  algorithm: Algorithm;
};

export const AlgorithmOption = ({ algorithm }: AlgorithmOptionProps) => {
  const getActionColor = (action: string | undefined | null) => {
    switch (action) {
      case 'BUY':
        return 'text-btn-red-color';
      case 'SELL':
        return 'text-btn-blue-color';
      default:
        return '';
    }
  };

  const options = [
    {
      optionName: '구매',
      optionDescription: `${algorithm.entryMethod === 'ONCE' ? '일시' : '분할'} | ${
        algorithm.entryInvestmentMethod === 'FIXED_AMOUNT'
          ? `${algorithm.entryFixedAmount ? addCommasToThousand(algorithm.entryFixedAmount) : 0}원`
          : `${algorithm.entryFixedPercentage}%`
      }`,
    },
    {
      optionName: '판매',
      optionDescription: `${algorithm.exitMethod === 'ONCE' ? '일시' : '분할'} | ${
        algorithm.exitInvestmentMethod === 'FIXED_AMOUNT'
          ? `${algorithm.exitFixedAmount ? addCommasToThousand(algorithm.exitFixedAmount) : 0}원`
          : `${algorithm.exitFixedPercentage}%`
      }`,
    },
    // {
    //   optionName: '수수료',
    //   optionDescription: algorithm.isFee ? '포함' : '미포함',
    // },
    ...(algorithm.profitPercentToSell
      ? [
          {
            optionName: <TermTooltip term="이익률">이익률</TermTooltip>,
            optionDescription: `${algorithm.profitPercentToSell}%`,
          },
        ]
      : []),
    ...(algorithm.lossPercentToSell
      ? [
          {
            optionName: <TermTooltip term="손절매">손절매</TermTooltip>,
            optionDescription: `${algorithm.lossPercentToSell}%`,
          },
        ]
      : []),
    ...(algorithm.oneMinuteIncreasePercent || algorithm.oneMinuteDecreasePercent
      ? [
          {
            optionName: '단기 변화 반응',
            optionDescription: (
              <>
                {algorithm.oneMinuteIncreasePercent && (
                  <>
                    상승: {algorithm.oneMinuteIncreasePercent}% (
                    <span className={getActionColor(algorithm.oneMinuteIncreaseAction)}>
                      {algorithm.oneMinuteIncreaseAction}
                    </span>
                    )
                  </>
                )}
                {algorithm.oneMinuteDecreasePercent && (
                  <>
                    {algorithm.oneMinuteIncreasePercent && ' / '}
                    하락: {algorithm.oneMinuteDecreasePercent}% (
                    <span className={getActionColor(algorithm.oneMinuteDecreaseAction)}>
                      {algorithm.oneMinuteDecreaseAction}
                    </span>
                    )
                  </>
                )}
              </>
            ),
          },
        ]
      : []),
    ...(algorithm.dailyIncreasePercent || algorithm.dailyDecreasePercent
      ? [
          {
            optionName: '일간 추세 반응',
            optionDescription: (
              <>
                {algorithm.dailyIncreasePercent && (
                  <>
                    상승: {algorithm.dailyIncreasePercent}% (
                    <span className={getActionColor(algorithm.dailyIncreaseAction)}>
                      {algorithm.dailyIncreaseAction}
                    </span>
                    )
                  </>
                )}
                {algorithm.dailyDecreasePercent && (
                  <>
                    {algorithm.dailyIncreasePercent && ' / '}
                    하락: {algorithm.dailyDecreasePercent}% (
                    <span className={getActionColor(algorithm.dailyDecreaseAction)}>
                      {algorithm.dailyDecreaseAction}
                    </span>
                    )
                  </>
                )}
              </>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {options.map((option, index) => (
        <p
          key={index}
          className="rounded-[10px] bg-background-color p-2 text-text-inactive-3-color"
        >
          <span>{option.optionName} : </span>
          <span className="text-text-main-color">{option.optionDescription}</span>
        </p>
      ))}
    </div>
  );
};
