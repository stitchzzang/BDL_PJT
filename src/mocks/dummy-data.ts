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

// 임시 더미 데이터 생성 함수
const generateDummyMinuteData = (count: number): MinuteCandleData[] => {
  const data: MinuteCandleData[] = [];
  let basePrice = 50000;

  // 시작 시간을 09:01로 설정
  const startDate = new Date();
  startDate.setHours(9, 1, 0, 0);

  for (let i = 0; i < count; i++) {
    const time = new Date(startDate);
    time.setMinutes(time.getMinutes() + i);

    // 거래 시간 체크 (09:01 ~ 15:20)
    const hours = time.getHours();
    const minutes = time.getMinutes();
    if (
      hours < 9 ||
      (hours === 9 && minutes === 0) ||
      (hours === 15 && minutes > 20) ||
      hours > 15
    ) {
      continue;
    }

    // 가격 변동 (랜덤하게)
    const priceChange = (Math.random() - 0.5) * 1000;
    basePrice += priceChange;

    // 동시호가 시간(15:21~15:29)에는 거래량 0으로 설정
    const isClosingAuction = hours === 15 && minutes >= 21 && minutes <= 29;

    data.push({
      stockCandleId: `dummy-${i}`,
      companyId: 'dummy-company',
      openPrice: basePrice,
      openPricePercent: (priceChange / basePrice) * 100,
      highPrice: basePrice + Math.random() * 500,
      highPricePercent: ((Math.random() * 500) / basePrice) * 100,
      lowPrice: basePrice - Math.random() * 500,
      lowPricePercent: -((Math.random() * 500) / basePrice) * 100,
      closePrice: basePrice + (Math.random() - 0.5) * 1000,
      closePricePercent: (((Math.random() - 0.5) * 1000) / basePrice) * 100,
      contractingVolume: isClosingAuction ? 0 : Math.floor(Math.random() * 100000),
      accumulatedTradeAmount: Math.floor(Math.random() * 1000000000),
      tradingTime: time.toISOString(),
      fiveAverage: basePrice + (Math.random() - 0.5) * 500,
      twentyAverage: basePrice + (Math.random() - 0.5) * 1000,
    });
  }

  return data;
};

const generateDummyPeriodData = (count: number): PeriodCandleData[] => {
  const data: PeriodCandleData[] = [];
  let basePrice = 50000;

  // 시작 날짜를 과거로 설정 (count일 전부터 시작)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - count);
  startDate.setHours(15, 30, 0, 0); // 장 마감 시간으로 설정

  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // 주말 제외
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    // 가격 변동 (랜덤하게)
    const priceChange = (Math.random() - 0.5) * 2000;
    basePrice += priceChange;

    // 일봉 데이터 생성
    data.push({
      stockCandleId: `dummy-day-${i}`,
      companyId: 'dummy-company',
      openPrice: basePrice,
      openPricePercent: (priceChange / basePrice) * 100,
      highPrice: basePrice + Math.random() * 1000,
      highPricePercent: ((Math.random() * 1000) / basePrice) * 100,
      lowPrice: basePrice - Math.random() * 1000,
      lowPricePercent: -((Math.random() * 1000) / basePrice) * 100,
      closePrice: basePrice + (Math.random() - 0.5) * 2000,
      closePricePercent: (((Math.random() - 0.5) * 2000) / basePrice) * 100,
      accumulatedVolume: Math.floor(Math.random() * 1000000),
      accumulatedTradeAmount: Math.floor(Math.random() * 10000000000),
      tradingDate: date.toISOString(),
      periodType: '1',
      fiveAverage: basePrice + (Math.random() - 0.5) * 1000,
      twentyAverage: basePrice + (Math.random() - 0.5) * 2000,
    });

    // 주봉 데이터 (금요일마다)
    if (date.getDay() === 5) {
      data.push({
        stockCandleId: `dummy-week-${i}`,
        companyId: 'dummy-company',
        openPrice: basePrice,
        openPricePercent: (priceChange / basePrice) * 100,
        highPrice: basePrice + Math.random() * 2000,
        highPricePercent: ((Math.random() * 2000) / basePrice) * 100,
        lowPrice: basePrice - Math.random() * 2000,
        lowPricePercent: -((Math.random() * 2000) / basePrice) * 100,
        closePrice: basePrice + (Math.random() - 0.5) * 3000,
        closePricePercent: (((Math.random() - 0.5) * 3000) / basePrice) * 100,
        accumulatedVolume: Math.floor(Math.random() * 5000000),
        accumulatedTradeAmount: Math.floor(Math.random() * 50000000000),
        tradingDate: date.toISOString(),
        periodType: '2',
        fiveAverage: basePrice + (Math.random() - 0.5) * 2000,
        twentyAverage: basePrice + (Math.random() - 0.5) * 3000,
      });
    }

    // 월봉 데이터 (매월 마지막 거래일)
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    if (nextDay.getMonth() !== date.getMonth()) {
      data.push({
        stockCandleId: `dummy-month-${i}`,
        companyId: 'dummy-company',
        openPrice: basePrice,
        openPricePercent: (priceChange / basePrice) * 100,
        highPrice: basePrice + Math.random() * 3000,
        highPricePercent: ((Math.random() * 3000) / basePrice) * 100,
        lowPrice: basePrice - Math.random() * 3000,
        lowPricePercent: -((Math.random() * 3000) / basePrice) * 100,
        closePrice: basePrice + (Math.random() - 0.5) * 4000,
        closePricePercent: (((Math.random() - 0.5) * 4000) / basePrice) * 100,
        accumulatedVolume: Math.floor(Math.random() * 20000000),
        accumulatedTradeAmount: Math.floor(Math.random() * 200000000000),
        tradingDate: date.toISOString(),
        periodType: '3',
        fiveAverage: basePrice + (Math.random() - 0.5) * 3000,
        twentyAverage: basePrice + (Math.random() - 0.5) * 4000,
      });
    }
  }

  return data;
};

// 임시 더미 데이터 export
export const dummyMinuteData: CandleResponse<MinuteCandleData> = {
  companyId: 'dummy-company',
  limit: 100,
  cursor: null,
  data: generateDummyMinuteData(100),
};

export const dummyPeriodData: CandleResponse<PeriodCandleData> = {
  companyId: 'dummy-company',
  limit: 100,
  cursor: null,
  data: generateDummyPeriodData(100),
};
