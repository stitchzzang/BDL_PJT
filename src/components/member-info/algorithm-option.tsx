import { Algorithm } from '@/api/types/algorithm';

type AlgorithmOptionProps = {
  algorithm: Algorithm;
};

export const AlgorithmOption = ({ algorithm }: AlgorithmOptionProps) => {
  const options = [
    {
      optionName: '매수 방법',
      optionDescription: algorithm.entryMethod === 'ONCE' ? '일시 매수' : '분할 매수',
    },
    {
      optionName: '매도 방법',
      optionDescription: algorithm.exitMethod === 'ONCE' ? '일시 매도' : '분할 매도',
    },
    {
      optionName: '투자 방식',
      optionDescription:
        algorithm.entryInvestmentMethod === 'FIXED_AMOUNT'
          ? `고정금액: ${algorithm.entryFixedAmount?.toLocaleString()}원`
          : `비율: ${algorithm.entryFixedPercentage}%`,
    },
    ...(algorithm.profitPercentToSell
      ? [
          {
            optionName: '이익 실현',
            optionDescription: `${algorithm.profitPercentToSell}%`,
          },
        ]
      : []),
    ...(algorithm.lossPercentToSell
      ? [
          {
            optionName: '손절매',
            optionDescription: `${algorithm.lossPercentToSell}%`,
          },
        ]
      : []),
    ...(algorithm.oneMinuteIncreasePercent || algorithm.oneMinuteDecreasePercent
      ? [
          {
            optionName: '단기 변화 반응',
            optionDescription: `상승: ${algorithm.oneMinuteIncreasePercent}% (${algorithm.oneMinuteIncreaseAction}) / 하락: ${algorithm.oneMinuteDecreasePercent}% (${algorithm.oneMinuteDecreaseAction})`,
          },
        ]
      : []),
    ...(algorithm.dailyIncreasePercent || algorithm.dailyDecreasePercent
      ? [
          {
            optionName: '일간 추세 반응',
            optionDescription: `상승: ${algorithm.dailyIncreasePercent}% (${algorithm.dailyIncreaseAction}) / 하락: ${algorithm.dailyDecreasePercent}% (${algorithm.dailyDecreaseAction})`,
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
          <span>{option.optionDescription}</span>
        </p>
      ))}
    </div>
  );
};
