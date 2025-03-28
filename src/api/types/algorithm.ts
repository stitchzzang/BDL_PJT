export interface Algorithm {
  algorithmId?: number; // 알고리즘 이름
  algorithmName: string; // 수익률(%)이 이 값에 도달하면 매도
  entryMethod: 'ONCE' | 'DIVIDE'; // 매수 방법
  exitMethod: 'ONCE' | 'DIVIDE'; // 매도 방법
  profitPercentToSell?: number; // 수익률(%)이 이 값에 도달하면 매도
  lossPercentToSell?: number; // 손실률(%)이 이 값에 도달하면 매도
  oneMinuteIncreasePercent?: number; // 1분 증가 퍼센트
  oneMinuteIncreaseAction?: 'BUY' | 'SELL'; // 1분 증가 행동
  oneMinuteDecreasePercent?: number; // 1분 감소 퍼센트
  oneMinuteDecreaseAction?: 'BUY' | 'SELL'; // 1분 감소 행동
  dailyIncreasePercent?: number; // 일 증가 퍼센트
  dailyIncreaseAction?: 'BUY' | 'SELL'; // 일 증가 행동
  dailyDecreasePercent?: number; // 일 감소 퍼센트
  dailyDecreaseAction?: 'BUY' | 'SELL'; // 일 감소 행동
  shortTermMaPeriod?: number; // 단기 이동 평균 기간
  longTermMaPeriod?: number; // 장기 이동 평균 기간
  isFee?: boolean; // 수수료 여부
  entryInvestmentMethod: 'FIXED_AMOUNT' | 'FIXED_PERCENTAGE'; // 매수 투자 방법
  entryFixedAmount?: number; // 매수 투자 금액
  entryFixedPercentage: number; // 매수 투자 퍼센트
  exitInvestmentMethod?: 'FIXED_AMOUNT' | 'FIXED_PERCENTAGE'; // 매도 투자 방법
  exitFixedAmount?: number; // 매도 투자 금액
  exitFixedPercentage?: number; // 매도 투자 퍼센트
}

export interface AlgorithmResponse {
  algorithms: Algorithm[];
}
