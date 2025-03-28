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

export interface StockMinuteDefaultData {
  companyId: string;
  limit: number;
  cursor: string;
  data: StockMinuteData[];
}

// 메시지 데이터 구조에 대한 타입 정의
export interface TickData {
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

// 매수,매도
// 지정가
export interface LimitOrderData {
  memberId: number; // 회원 ID
  companyId: number; // 종목 ID
  tradeType: number; // 0: 매수(구매), 1:매도(판매)
  quantity: number; // 주 개수
  price: number; // 지정가 - 가격
}

// 시장가
export interface MarketOrderData {
  memberId: number; // 회원 ID
  companyId: number; // 종목 ID
  tradeType: number; // 0: 매수(구매), 1:매도(판매)
  quantity: number; // 시장가 - 가격(현재 가격을 가져와야 함)
}

// 주문 대기목록
export interface UserSimulatedData {
  orderId: number;
  memberId: number;
  companyId: number;
  companyName: string;
  tradeType: number;
  quantity: number;
  price: number;
  tradingTime: string;
  auto: boolean;
  confirm: boolean;
}

// 주문리스트
export interface SimulatedData {
  memberId: number; // 회원 ID
  companyId: number; // 종목 ID
  tradeType: number; // 0: 매수(구매), 1:매도(판매)
  quantity: number; // 주 개수
  price: number; // 지정가 - 가격
  orderId: number;
}

// 호가 인터페이스
export interface OrderbookData {
  price: number;
  quantity: number;
}
