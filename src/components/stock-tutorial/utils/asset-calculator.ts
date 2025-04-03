/**
 * 주식 튜토리얼에서 자산 계산을 위한 유틸리티 함수
 */

// 주식 거래를 처리하는 유틸리티 함수
export const calculateTradingAssets = (
  action: 'buy' | 'sell' | 'wait',
  price: number,
  quantity: number,
  initialAsset: number,
  currentAvailableAsset: number,
  ownedStockCount: number,
  currentStockPrice: number,
) => {
  // 초기 설정
  let newAvailableAsset = currentAvailableAsset;
  let newOwnedStockCount = ownedStockCount;

  // 거래 처리
  if (action === 'buy') {
    // 매수: 주문 가능 금액에서 (지정가 * 수량) 차감
    newAvailableAsset -= price * quantity;
    // 보유 주식 수 증가
    newOwnedStockCount += quantity;
  } else if (action === 'sell') {
    // 매도: 주문 가능 금액 증가 (지정가 * 수량)
    newAvailableAsset += price * quantity;
    // 보유 주식에서 해당 수량 차감
    newOwnedStockCount -= quantity;
  }
  // 관망(wait)의 경우 자산 변동 없음

  // 현재 자산 업데이트 (주문 가능 금액 + 보유 주식 * 현재가)
  const newTotalAsset = newAvailableAsset + newOwnedStockCount * currentStockPrice;

  // 수익률 업데이트 ((현재 자산 - 초기 자산) / 초기 자산) * 100
  const newReturnRate = ((newTotalAsset - initialAsset) / initialAsset) * 100;

  return {
    availableOrderAsset: newAvailableAsset,
    ownedStockCount: newOwnedStockCount,
    currentTotalAsset: newTotalAsset,
    totalReturnRate: newReturnRate,
  };
};

// 턴이 변경될 때 이전 턴과 현재 턴의 주가 차이를 반영하여 자산 정보를 업데이트하는 함수
export const updateAssetsByTurnChange = (
  initialAsset: number,
  prevStockPrice: number,
  currentStockPrice: number,
  availableOrderAsset: number,
  ownedStockCount: number,
) => {
  // 이전 턴과 현재 턴의 주가 변화율 계산
  const priceChangeRate = (currentStockPrice - prevStockPrice) / prevStockPrice;

  // 보유 주식 가치 변화 계산 (보유 주식 수 * 주가 변화율 * 이전 주가)
  const stockValueChange = ownedStockCount * priceChangeRate * prevStockPrice;

  // 이전 총 자산 계산
  const prevTotalAsset = availableOrderAsset + ownedStockCount * prevStockPrice;

  // 현재 총 자산 계산 (이전 총 자산 + 주식 가치 변화)
  const currentTotalAsset = prevTotalAsset + stockValueChange;

  // 수익률 계산 ((현재 총 자산 - 초기 자산) / 초기 자산 * 100)
  const totalReturnRate = ((currentTotalAsset - initialAsset) / initialAsset) * 100;

  // 주문 가능 자산은 변경되지 않음 (매수/매도가 없으므로)
  return {
    availableOrderAsset,
    currentTotalAsset,
    totalReturnRate,
  };
};
