// 분봉 데이터 타입
export interface MinuteCandleData {
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

// API 응답 타입
export interface CandleResponse<T> {
  companyId: string;
  limit: number;
  cursor: string | null;
  data: T[];
}

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

// 날짜 포맷팅 유틸리티 함수
export const formatDate = (date: Date, type: 'MINUTE' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR') => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  switch (type) {
    case 'MINUTE':
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    case 'DAY':
      return `${year}-${month}-${day}`;
    case 'WEEK':
      return `${year}-${month}-${day}`;
    case 'MONTH':
      return `${year}-${month}`;
    case 'YEAR':
      return `${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
};

// API 데이터를 차트 데이터로 변환하는 유틸리티 함수
export const convertMinuteCandleToChartData = (data: MinuteCandleData): ChartDataPoint => {
  const tradingTime = data.tradingTime ? new Date(data.tradingTime) : null;
  return {
    date: tradingTime ? formatDate(tradingTime, 'MINUTE') : '',
    open: data.openPrice,
    high: data.highPrice,
    low: data.lowPrice,
    close: data.closePrice,
    volume: data.contractingVolume,
    changeType: data.closePrice >= data.openPrice ? 'RISE' : 'FALL',
    fiveAverage: data.fiveAverage,
    twentyAverage: data.twentyAverage,
    rawDate: tradingTime,
    periodType: 'MINUTE',
  };
};

export const convertPeriodCandleToChartData = (data: PeriodCandleData): ChartDataPoint => {
  const tradingDate = data.tradingDate ? new Date(data.tradingDate) : null;
  const periodType = data.periodType === '1' ? 'DAY' : data.periodType === '2' ? 'WEEK' : 'MONTH';

  return {
    date: tradingDate ? formatDate(tradingDate, periodType) : '',
    open: data.openPrice,
    high: data.highPrice,
    low: data.lowPrice,
    close: data.closePrice,
    volume: data.accumulatedVolume,
    changeType: data.closePrice >= data.openPrice ? 'RISE' : 'FALL',
    fiveAverage: data.fiveAverage,
    twentyAverage: data.twentyAverage,
    rawDate: tradingDate,
    periodType,
  };
};
