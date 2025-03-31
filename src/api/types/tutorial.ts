// 차트 컴포넌트에서 사용할 통합 데이터 타입
export interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  changeType: 'RISE' | 'FALL' | 'NONE';
  fiveAverage: number;
  twentyAverage: number;
  rawDate: Date | null;
  periodType: 'MINUTE' | 'DAY' | 'WEEK' | 'MONTH';
}

// 분봉 데이터 타입
export interface MinuteCandleData {
  stockCandleMinuteId: string;
  companyId: string;
  openPrice: number;
  openPricePercent: number;
  highPrice: number;
  highPricePercent: number;
  lowPrice: number;
  lowPricePercent: number;
  closePrice: number;
  closePricePercent: number;
  contractingVolume: number;
  accumulatedTradeAmount: number;
  tradingTime: string | null;
  fiveAverage: number;
  twentyAverage: number;
}

// 일/주/월봉 데이터 타입
export interface PeriodCandleData {
  stockCandleId: string;
  companyId: string;
  openPrice: number;
  openPricePercent: number;
  highPrice: number;
  highPricePercent: number;
  lowPrice: number;
  lowPricePercent: number;
  closePrice: number;
  closePricePercent: number;
  accumulatedVolume: number;
  accumulatedTradeAmount: number;
  tradingDate: string | null;
  periodType: '1' | '2' | '3'; // 1: 일봉, 2: 주봉, 3: 월봉
  fiveAverage: number;
  twentyAverage: number;
}

// 변곡점 데이터 타입
export interface Point {
  pointId: number;
  stockCandleId: number;
  newsId: number;
  rate: number;
}

// 튜토리얼 초기화 요청 타입
export interface TutorialInitRequest {
  memberId: number;
  companyId: number;
}

// 사용자 행동 요청 타입
export interface TutorialActionRequest {
  action: 'buy' | 'sell';
  price: number;
  quantity: number;
  companyId: number;
  startStockCandleId: number;
  endStockCandleId: number;
}

// 자산 응답 타입
export interface AssetResponse {
  tradingDate: string;
  availableOrderAsset: number;
  currentTotalAsset: number;
  totalReturnRate: number;
}

// 뉴스 요청 타입
export interface NewsRequest {
  companyId: number;
  stockCandleId?: number;
  startStockCandleId?: number;
  endStockCandleId?: number;
}

// 뉴스 응답 타입
export interface NewsResponse {
  stockCandleId: number;
  changeRate: number;
  newsId: number;
  newsTitle: string;
  newsDate: string;
}

// 뉴스 상세 응답 타입
export interface NewsResponseWithThumbnail extends NewsResponse {
  newsContent: string;
  newsThumbnailUrl: string;
}

// 튜토리얼 결과 저장 요청 타입
export interface TutorialResultSaveRequest {
  companyId: number;
  startMoney: number;
  endMoney: number;
  changeRate: number;
  startDate: string;
  endDate: string;
  memberId: number;
}

// 튜토리얼 결과 응답 타입
export interface TutorialResultResponse {
  tutorialResultId: number;
  companyId: number;
  companyName: string;
  startMoney: number;
  endMoney: number;
  changeRate?: number;
  startDate: string;
  endDate: string;
  memberId: number;
  memberName: string;
}

// // API 응답 타입
// export interface CandleResponse<T> {
//     companyId: string;
//     limit: number;
//     cursor: string | null;
//     data: T[];
// }
export interface TutorialResultResponse {
  tutorialResultId: number;
  companyId: number;
  companyName: string;
  startMoney: number;
  endMoney: number;
  startDate: string;
  endDate: string;
  memberId: number;
  memberName: string;
}
