// API 응답 공통 타입
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  result: T;
}

// 변곡점 타입
export interface Point {
  pointId: number;
  stockCandleId: number;
  newsId: number;
  rate: number;
}

// 일봉 데이터 타입
export interface StockCandle {
  stockCandleId: number;
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
  tradingDate: string;
  periodType: number;
  fiveAverage: number;
  twentyAverage: number;
}

// 튜토리얼 일봉 응답 타입
export interface TutorialStockResponse {
  companyId: string;
  limit: number;
  cursor: string;
  data: StockCandle[];
}

// 뉴스 응답 타입
export interface NewsResponse {
  stockCandleId: number;
  changeRate: number;
  newsId: number;
  newsTitle: string;
  newsDate: string;
}

// 썸네일이 포함된 뉴스 응답 타입
export interface NewsResponseWithThumbnail extends NewsResponse {
  newsContent: string;
  newsThumbnailUrl: string;
}

// 자산 응답 타입
export interface AssetResponse {
  tradingDate: string;
  availableOrderAsset: number;
  currentTotalAsset: number;
  totalReturnRate: number;
}

// 튜토리얼 결과 타입
export interface TutorialResultResponse {
  tutorialResultId: number;
  companyId: number;
  companyImage: string;
  companyName: string;
  startMoney: number;
  endMoney: number;
  changeRate?: number;
  startDate: string;
  endDate: string;
  memberId: number;
  memberName: string;
}

// 요청 타입
export interface InitSessionRequest {
  memberId: number;
  companyId: number;
}

// stockCandleId 기반 요청 (기존 API)
export interface NewsRangeRequest {
  companyId: number;
  startStockCandleId: number;
  endStockCandleId: number;
}

// 날짜 기반 요청 (새 API)
export interface DateRangeRequest {
  companyId: number;
  startDate: string; // YYMMDD 형식
  endDate: string; // YYMMDD 형식
}

export interface CurrentNewsRequest {
  companyId: number;
  stockCandleId: number;
}

export interface UserActionRequest {
  action: string;
  price: number;
  quantity: number;
  companyId: number;
  startStockCandleId: number;
  endStockCandleId: number;
}

export interface SaveTutorialResultRequest {
  companyId: number;
  startMoney: number;
  endMoney: number;
  changeRate: number;
  startDate: string;
  endDate: string;
  memberId: number;
}
