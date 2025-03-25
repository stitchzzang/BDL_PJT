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

// 메시지 데이터 구조에 대한 타입 정의
export interface TradeData {
  /** 종목 코드 (예: "005930") */
  stockCode: string;

  /** 주식 체결 시간 (문자열, HHmmss 형식 등) */
  stckCntgHour: string;

  /** 주식 현재가 (체결 가격) */
  stckPrpr: number;

  /** 주식 시가 */
  stckOprc: number;

  /** 주식 최고가 */
  stckHgpr: number;

  /** 주식 최저가 */
  stckLwpr: number;

  /** 체결 거래량 */
  cntgVol: number;

  /** 누적 거래량 */
  acmlVol: number;

  /** 누적 거래 대금 */
  acmlTrPbm: number;

  /** 체결구분 (예: "1" - 매수, "3" - 장전, "5" - 매도) */
  ccldDvsn: string;
}
