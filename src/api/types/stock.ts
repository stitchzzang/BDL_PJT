export interface StockMinuteData {
  stockCandleMinuteId: number; // 주식 봉의 고유 ID
  companyId: string; // 종목 ID
  openPrice: number; // 시가
  openPricePercent: number; // 시간 변동률 (%)
  highPrice: number; // 고가
  highPricePercent: number; // 고가 변동률 (%)
  lowPrice: number; // 저가
  lowPricePercent: number; // 저가 변동률 (%)
  closePrice: number; // 종가
  closePricePercent: number; // 종가 변동률 (%)
  contractingVolume: number; // 거래량
  accumulatedTradeAmount: number; // 누적 거래대금
  tradingTime: string; // 주식 거래 날짜
  fiveAverage: number; // 5 이평선
  twentyAverage: number; // 20 이평선
}
