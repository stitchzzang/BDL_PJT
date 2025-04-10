// 분봉 데이터 타입
export interface MinuteCandleData {
  stockCandleId: string; // 주식 봉의 고유 ID
  companyId: string; // 종목 ID
  openPrice: number; // 시가
  openPricePercent: number; // 시간 변동률
  highPrice: number; // 고가
  highPricePercent: number; // 고가 변동률
  lowPrice: number; // 저가
  lowPricePercent: number; // 저가 변동률
  closePrice: number; // 종가
  closePricePercent: number; // 종가 변동률
  contractingVolume: number; // 거래량
  accumulatedTradeAmount: number; // 누적 거래대금
  tradingTime: string | null; // 주식 거래 날짜
  fiveAverage: number; // 5 이평선
  twentyAverage: number; // 20 이평선
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

// 알고리즘 랩에서 사용할 5분봉 더미 데이터
export const DUMMY_ALGORITHM_LAB_MINUTE_CHART_DATA = {
  companyId: '1',
  limit: 20,
  cursor: '0',
  data: [
    {
      stockCandleMinuteId: 1,
      companyId: '1',
      openPrice: 33000,
      openPricePercent: 0,
      highPrice: 33500,
      highPricePercent: 1.52,
      lowPrice: 32800,
      lowPricePercent: -0.61,
      closePrice: 33200,
      closePricePercent: 0.61,
      contractingVolume: 1200,
      accumulatedTradeAmount: 39840000,
      tradingTime: '2025-01-01T09:00:00+09:00',
      fiveAverage: 33100,
      twentyAverage: 32900,
    },
    {
      stockCandleMinuteId: 2,
      companyId: '1',
      openPrice: 33200,
      openPricePercent: 0.61,
      highPrice: 33600,
      highPricePercent: 1.82,
      lowPrice: 33100,
      lowPricePercent: 0.3,
      closePrice: 33400,
      closePricePercent: 1.21,
      contractingVolume: 800,
      accumulatedTradeAmount: 26720000,
      tradingTime: '2025-01-01T09:01:00+09:00',
      fiveAverage: 33150,
      twentyAverage: 32950,
    },
    {
      stockCandleMinuteId: 3,
      companyId: '1',
      openPrice: 33400,
      openPricePercent: 1.21,
      highPrice: 33700,
      highPricePercent: 2.12,
      lowPrice: 33300,
      lowPricePercent: 0.91,
      closePrice: 33600,
      closePricePercent: 1.82,
      contractingVolume: 1500,
      accumulatedTradeAmount: 50400000,
      tradingTime: '2025-01-01T09:02:00+09:00',
      fiveAverage: 33200,
      twentyAverage: 33000,
    },
    {
      stockCandleMinuteId: 4,
      companyId: '1',
      openPrice: 33600,
      openPricePercent: 1.82,
      highPrice: 33800,
      highPricePercent: 2.42,
      lowPrice: 33500,
      lowPricePercent: 1.52,
      closePrice: 33750,
      closePricePercent: 2.27,
      contractingVolume: 1000,
      accumulatedTradeAmount: 33750000,
      tradingTime: '2025-01-01T09:03:00+09:00',
      fiveAverage: 33300,
      twentyAverage: 33050,
    },
    {
      stockCandleMinuteId: 5,
      companyId: '1',
      openPrice: 33750,
      openPricePercent: 2.27,
      highPrice: 33900,
      highPricePercent: 2.73,
      lowPrice: 33600,
      lowPricePercent: 1.82,
      closePrice: 33650,
      closePricePercent: 1.97,
      contractingVolume: 900,
      accumulatedTradeAmount: 30285000,
      tradingTime: '2025-01-01T09:04:00+09:00',
      fiveAverage: 33400,
      twentyAverage: 33100,
    },
  ],
};

// 알고리즘 랩에서 사용할 일봉 더미 데이터
export const DUMMY_ALGORITHM_LAB_DAILY_CHART_DATA = {
  companyId: '1',
  limit: 30,
  cursor: '0',
  data: [
    {
      stockCandleId: 1,
      companyId: '1',
      openPrice: 62500,
      openPricePercent: -1.52,
      highPrice: 63800,
      highPricePercent: 2.42,
      lowPrice: 62400,
      lowPricePercent: -1.82,
      closePrice: 63200,
      closePricePercent: 0.61,
      accumulatedVolume: 1250000,
      accumulatedTradeAmount: 415000000000,
      tradingDate: '2024-01-01T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 63000,
      twentyAverage: 62800,
    },
    {
      stockCandleId: 2,
      companyId: '1',
      openPrice: 63200,
      openPricePercent: 0.61,
      highPrice: 64100,
      highPricePercent: 3.33,
      lowPrice: 62800,
      lowPricePercent: 0,
      closePrice: 63950,
      closePricePercent: 2.88,
      accumulatedVolume: 1300000,
      accumulatedTradeAmount: 441350000000,
      tradingDate: '2024-01-02T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 63100,
      twentyAverage: 62850,
    },
    {
      stockCandleId: 3,
      companyId: '1',
      openPrice: 63950,
      openPricePercent: 2.88,
      highPrice: 64200,
      highPricePercent: 3.64,
      lowPrice: 63500,
      lowPricePercent: 2.42,
      closePrice: 64000,
      closePricePercent: 3.03,
      accumulatedVolume: 1100000,
      accumulatedTradeAmount: 374000000000,
      tradingDate: '2024-01-03T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 63200,
      twentyAverage: 62900,
    },
    {
      stockCandleId: 4,
      companyId: '1',
      openPrice: 64000,
      openPricePercent: 3.03,
      highPrice: 64400,
      highPricePercent: 4.24,
      lowPrice: 63700,
      lowPricePercent: 2.12,
      closePrice: 64300,
      closePricePercent: 3.94,
      accumulatedVolume: 1400000,
      accumulatedTradeAmount: 480200000000,
      tradingDate: '2024-01-04T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 63300,
      twentyAverage: 62950,
    },
    {
      stockCandleId: 5,
      companyId: '1',
      openPrice: 64300,
      openPricePercent: 3.94,
      highPrice: 64600,
      highPricePercent: 4.85,
      lowPrice: 63900,
      lowPricePercent: 2.73,
      closePrice: 64000,
      closePricePercent: 3.03,
      accumulatedVolume: 1350000,
      accumulatedTradeAmount: 459000000000,
      tradingDate: '2024-01-05T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 63400,
      twentyAverage: 63000,
    },
  ],
};

// 튜토리얼에서 사용할 일봉 더미 데이터
export const DUMMY_DAILY_CHART_DATA = {
  companyId: '1',
  limit: 30,
  cursor: '0',
  data: [
    {
      stockCandleId: 1,
      companyId: '1',
      openPrice: 62500,
      openPricePercent: -1.52,
      highPrice: 63800,
      highPricePercent: 2.42,
      lowPrice: 62400,
      lowPricePercent: -1.82,
      closePrice: 63200,
      closePricePercent: 0.61,
      accumulatedVolume: 1250000,
      accumulatedTradeAmount: 415000000000,
      tradingDate: '2024-12-01T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 63000,
      twentyAverage: 62800,
    },
    {
      stockCandleId: 2,
      companyId: '1',
      openPrice: 63200,
      openPricePercent: 0.61,
      highPrice: 64100,
      highPricePercent: 3.33,
      lowPrice: 62800,
      lowPricePercent: 0,
      closePrice: 63950,
      closePricePercent: 2.88,
      accumulatedVolume: 1300000,
      accumulatedTradeAmount: 441350000000,
      tradingDate: '2024-12-02T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 63100,
      twentyAverage: 62850,
    },
    {
      stockCandleId: 3,
      companyId: '1',
      openPrice: 63950,
      openPricePercent: 2.88,
      highPrice: 64200,
      highPricePercent: 3.64,
      lowPrice: 63500,
      lowPricePercent: 2.42,
      closePrice: 64000,
      closePricePercent: 3.03,
      accumulatedVolume: 1100000,
      accumulatedTradeAmount: 374000000000,
      tradingDate: '2024-12-03T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 63200,
      twentyAverage: 62900,
    },
    {
      stockCandleId: 4,
      companyId: '1',
      openPrice: 64000,
      openPricePercent: 3.03,
      highPrice: 64400,
      highPricePercent: 4.24,
      lowPrice: 63700,
      lowPricePercent: 2.12,
      closePrice: 64300,
      closePricePercent: 3.94,
      accumulatedVolume: 1400000,
      accumulatedTradeAmount: 480200000000,
      tradingDate: '2024-12-04T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 63300,
      twentyAverage: 62950,
    },
    {
      stockCandleId: 5,
      companyId: '1',
      openPrice: 64300,
      openPricePercent: 3.94,
      highPrice: 64600,
      highPricePercent: 4.85,
      lowPrice: 63900,
      lowPricePercent: 2.73,
      closePrice: 64000,
      closePricePercent: 3.03,
      accumulatedVolume: 1350000,
      accumulatedTradeAmount: 459000000000,
      tradingDate: '2024-12-05T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 63400,
      twentyAverage: 63000,
    },
    {
      stockCandleId: 6,
      companyId: '1',
      openPrice: 64000,
      openPricePercent: 3.03,
      highPrice: 65100,
      highPricePercent: 5.65,
      lowPrice: 63800,
      lowPricePercent: 2.42,
      closePrice: 64800,
      closePricePercent: 4.52,
      accumulatedVolume: 1580000,
      accumulatedTradeAmount: 502400000000,
      tradingDate: '2024-12-06T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 63700,
      twentyAverage: 63100,
    },
    {
      stockCandleId: 7,
      companyId: '1',
      openPrice: 64800,
      openPricePercent: 4.52,
      highPrice: 65300,
      highPricePercent: 5.97,
      lowPrice: 64200,
      lowPricePercent: 3.55,
      closePrice: 65000,
      closePricePercent: 5.17,
      accumulatedVolume: 1420000,
      accumulatedTradeAmount: 487500000000,
      tradingDate: '2024-12-09T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 64000,
      twentyAverage: 63200,
    },
    {
      stockCandleId: 8,
      companyId: '1',
      openPrice: 65000,
      openPricePercent: 5.17,
      highPrice: 66200,
      highPricePercent: 7.42,
      lowPrice: 64800,
      lowPricePercent: 4.52,
      closePrice: 66000,
      closePricePercent: 6.77,
      accumulatedVolume: 1800000,
      accumulatedTradeAmount: 580000000000,
      tradingDate: '2024-12-10T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 64500,
      twentyAverage: 63300,
    },
    {
      stockCandleId: 9,
      companyId: '1',
      openPrice: 66000,
      openPricePercent: 6.77,
      highPrice: 67500,
      highPricePercent: 9.68,
      lowPrice: 65800,
      lowPricePercent: 6.45,
      closePrice: 67200,
      closePricePercent: 8.71,
      accumulatedVolume: 2200000,
      accumulatedTradeAmount: 724000000000,
      tradingDate: '2024-12-11T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 65000,
      twentyAverage: 63500,
    },
    {
      stockCandleId: 10,
      companyId: '1',
      openPrice: 67200,
      openPricePercent: 8.71,
      highPrice: 68500,
      highPricePercent: 10.97,
      lowPrice: 67000,
      lowPricePercent: 8.38,
      closePrice: 68200,
      closePricePercent: 10.32,
      accumulatedVolume: 2500000,
      accumulatedTradeAmount: 850000000000,
      tradingDate: '2024-12-12T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 65500,
      twentyAverage: 63800,
    },
    {
      stockCandleId: 11,
      companyId: '1',
      openPrice: 68200,
      openPricePercent: 10.32,
      highPrice: 69000,
      highPricePercent: 11.61,
      lowPrice: 67500,
      lowPricePercent: 9.03,
      closePrice: 68000,
      closePricePercent: 9.68,
      accumulatedVolume: 1900000,
      accumulatedTradeAmount: 646000000000,
      tradingDate: '2024-12-13T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 66000,
      twentyAverage: 64000,
    },
    {
      stockCandleId: 12,
      companyId: '1',
      openPrice: 68000,
      openPricePercent: 9.68,
      highPrice: 68500,
      highPricePercent: 10.48,
      lowPrice: 66800,
      lowPricePercent: 7.74,
      closePrice: 67000,
      closePricePercent: 8.06,
      accumulatedVolume: 1850000,
      accumulatedTradeAmount: 620000000000,
      tradingDate: '2024-12-16T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 66500,
      twentyAverage: 64200,
    },
    {
      stockCandleId: 13,
      companyId: '1',
      openPrice: 67000,
      openPricePercent: 8.06,
      highPrice: 67800,
      highPricePercent: 9.35,
      lowPrice: 66500,
      lowPricePercent: 7.26,
      closePrice: 67600,
      closePricePercent: 9.03,
      accumulatedVolume: 1620000,
      accumulatedTradeAmount: 547560000000,
      tradingDate: '2024-12-17T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 67000,
      twentyAverage: 64500,
    },
    {
      stockCandleId: 14,
      companyId: '1',
      openPrice: 67600,
      openPricePercent: 9.03,
      highPrice: 69200,
      highPricePercent: 11.94,
      lowPrice: 67400,
      lowPricePercent: 8.71,
      closePrice: 69000,
      closePricePercent: 11.61,
      accumulatedVolume: 2100000,
      accumulatedTradeAmount: 730000000000,
      tradingDate: '2024-12-18T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 67800,
      twentyAverage: 64800,
    },
    {
      stockCandleId: 15,
      companyId: '1',
      openPrice: 69000,
      openPricePercent: 11.61,
      highPrice: 70500,
      highPricePercent: 14.03,
      lowPrice: 68800,
      lowPricePercent: 11.29,
      closePrice: 70200,
      closePricePercent: 13.55,
      accumulatedVolume: 2850000,
      accumulatedTradeAmount: 999000000000,
      tradingDate: '2024-12-19T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 68400,
      twentyAverage: 65000,
    },
    {
      stockCandleId: 16,
      companyId: '1',
      openPrice: 70200,
      openPricePercent: 13.55,
      highPrice: 71000,
      highPricePercent: 14.84,
      lowPrice: 69800,
      lowPricePercent: 12.9,
      closePrice: 70500,
      closePricePercent: 14.03,
      accumulatedVolume: 2200000,
      accumulatedTradeAmount: 775500000000,
      tradingDate: '2024-12-20T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 69000,
      twentyAverage: 65500,
    },
    {
      stockCandleId: 17,
      companyId: '1',
      openPrice: 70500,
      openPricePercent: 14.03,
      highPrice: 72000,
      highPricePercent: 16.13,
      lowPrice: 70200,
      lowPricePercent: 13.55,
      closePrice: 71800,
      closePricePercent: 15.81,
      accumulatedVolume: 2400000,
      accumulatedTradeAmount: 864000000000,
      tradingDate: '2024-12-23T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 69800,
      twentyAverage: 66000,
    },
    {
      stockCandleId: 18,
      companyId: '1',
      openPrice: 71800,
      openPricePercent: 15.81,
      highPrice: 73000,
      highPricePercent: 17.74,
      lowPrice: 71500,
      lowPricePercent: 15.32,
      closePrice: 72800,
      closePricePercent: 17.42,
      accumulatedVolume: 2650000,
      accumulatedTradeAmount: 955000000000,
      tradingDate: '2024-12-24T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 70500,
      twentyAverage: 66500,
    },
    {
      stockCandleId: 19,
      companyId: '1',
      openPrice: 72800,
      openPricePercent: 17.42,
      highPrice: 73500,
      highPricePercent: 18.55,
      lowPrice: 72200,
      lowPricePercent: 16.45,
      closePrice: 73000,
      closePricePercent: 17.74,
      accumulatedVolume: 2200000,
      accumulatedTradeAmount: 803000000000,
      tradingDate: '2024-12-26T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 71200,
      twentyAverage: 67000,
    },
    {
      stockCandleId: 20,
      companyId: '1',
      openPrice: 73000,
      openPricePercent: 17.74,
      highPrice: 74500,
      highPricePercent: 20.16,
      lowPrice: 72800,
      lowPricePercent: 17.42,
      closePrice: 74200,
      closePricePercent: 19.68,
      accumulatedVolume: 2800000,
      accumulatedTradeAmount: 1038800000000,
      tradingDate: '2024-12-27T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 72000,
      twentyAverage: 67500,
    },
    {
      stockCandleId: 21,
      companyId: '1',
      openPrice: 74200,
      openPricePercent: 19.68,
      highPrice: 75000,
      highPricePercent: 20.97,
      lowPrice: 73500,
      lowPricePercent: 18.55,
      closePrice: 74000,
      closePricePercent: 19.35,
      accumulatedVolume: 2100000,
      accumulatedTradeAmount: 777000000000,
      tradingDate: '2024-12-30T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 72800,
      twentyAverage: 68000,
    },
    {
      stockCandleId: 22,
      companyId: '1',
      openPrice: 74000,
      openPricePercent: 19.35,
      highPrice: 75500,
      highPricePercent: 21.77,
      lowPrice: 73800,
      lowPricePercent: 19.03,
      closePrice: 75200,
      closePricePercent: 21.29,
      accumulatedVolume: 2700000,
      accumulatedTradeAmount: 1012000000000,
      tradingDate: '2025-01-02T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 73500,
      twentyAverage: 68500,
    },
    {
      stockCandleId: 23,
      companyId: '1',
      openPrice: 75200,
      openPricePercent: 21.29,
      highPrice: 75800,
      highPricePercent: 22.26,
      lowPrice: 74500,
      lowPricePercent: 20.16,
      closePrice: 75500,
      closePricePercent: 21.77,
      accumulatedVolume: 2300000,
      accumulatedTradeAmount: 869000000000,
      tradingDate: '2025-01-03T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 74200,
      twentyAverage: 69000,
    },
    {
      stockCandleId: 24,
      companyId: '1',
      openPrice: 75500,
      openPricePercent: 21.77,
      highPrice: 76800,
      highPricePercent: 23.87,
      lowPrice: 75200,
      lowPricePercent: 21.29,
      closePrice: 76500,
      closePricePercent: 23.39,
      accumulatedVolume: 2600000,
      accumulatedTradeAmount: 994500000000,
      tradingDate: '2025-01-06T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 75000,
      twentyAverage: 69500,
    },
    {
      stockCandleId: 25,
      companyId: '1',
      openPrice: 76500,
      openPricePercent: 23.39,
      highPrice: 77200,
      highPricePercent: 24.52,
      lowPrice: 75800,
      lowPricePercent: 22.26,
      closePrice: 76800,
      closePricePercent: 23.87,
      accumulatedVolume: 2400000,
      accumulatedTradeAmount: 921600000000,
      tradingDate: '2025-01-07T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 75800,
      twentyAverage: 70000,
    },
    {
      stockCandleId: 26,
      companyId: '1',
      openPrice: 76800,
      openPricePercent: 23.87,
      highPrice: 77500,
      highPricePercent: 25.0,
      lowPrice: 76200,
      lowPricePercent: 22.9,
      closePrice: 77000,
      closePricePercent: 24.19,
      accumulatedVolume: 2100000,
      accumulatedTradeAmount: 808500000000,
      tradingDate: '2025-01-08T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 76500,
      twentyAverage: 70500,
    },
    {
      stockCandleId: 27,
      companyId: '1',
      openPrice: 77000,
      openPricePercent: 24.19,
      highPrice: 78500,
      highPricePercent: 26.61,
      lowPrice: 76800,
      lowPricePercent: 23.87,
      closePrice: 78200,
      closePricePercent: 26.13,
      accumulatedVolume: 2800000,
      accumulatedTradeAmount: 1094800000000,
      tradingDate: '2025-01-09T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 77000,
      twentyAverage: 71000,
    },
    {
      stockCandleId: 28,
      companyId: '1',
      openPrice: 78200,
      openPricePercent: 26.13,
      highPrice: 79000,
      highPricePercent: 27.42,
      lowPrice: 77500,
      lowPricePercent: 25.0,
      closePrice: 78800,
      closePricePercent: 27.1,
      accumulatedVolume: 2500000,
      accumulatedTradeAmount: 970000000000,
      tradingDate: '2025-01-10T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 77500,
      twentyAverage: 71500,
    },
    {
      stockCandleId: 29,
      companyId: '1',
      openPrice: 78800,
      openPricePercent: 27.1,
      highPrice: 79500,
      highPricePercent: 28.23,
      lowPrice: 78200,
      lowPricePercent: 26.13,
      closePrice: 79200,
      closePricePercent: 27.74,
      accumulatedVolume: 2200000,
      accumulatedTradeAmount: 871200000000,
      tradingDate: '2025-01-13T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 78000,
      twentyAverage: 72000,
    },
    {
      stockCandleId: 30,
      companyId: '1',
      openPrice: 79200,
      openPricePercent: 27.74,
      highPrice: 80000,
      highPricePercent: 29.03,
      lowPrice: 78500,
      lowPricePercent: 26.61,
      closePrice: 79500,
      closePricePercent: 28.23,
      accumulatedVolume: 2400000,
      accumulatedTradeAmount: 954000000000,
      tradingDate: '2025-01-14T00:00:00+09:00',
      periodType: 1,
      fiveAverage: 78500,
      twentyAverage: 72500,
    },
  ],
};
