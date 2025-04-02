// priceUtils.ts (또는 utilities.ts, calculation.ts 등)

// 가격 변화 계산을 위한 타입 정의
export interface PriceChangeResult {
  change: number;
  percent: string;
  isRise: boolean;
}

/**
 * 두 가격 사이의 변화량과 퍼센트를 계산하는 함수
 * @param currentPrice 현재 가격
 * @param comparePrice 비교 기준 가격
 * @returns 변화량, 퍼센트, 상승 여부를 포함한 객체
 */
export const calculatePriceChange = (
  currentPrice: number,
  comparePrice: number,
): PriceChangeResult => {
  if (!comparePrice || comparePrice === 0) return { change: 0, percent: '0.00', isRise: false };

  const priceDiff = currentPrice - comparePrice;
  const percentChange = (priceDiff / comparePrice) * 100;

  return {
    change: Math.abs(priceDiff),
    percent: Math.abs(percentChange).toFixed(2),
    isRise: priceDiff >= 0,
  };
};
