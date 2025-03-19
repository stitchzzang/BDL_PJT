export interface DataPoint {
  date: string;
  open: number; // 시가
  high: number; // 고가
  low: number; // 저가
  close: number; // 종가
  prevClose?: number; // 전일종가
  change?: number; // 전일대비변동
  changeType?: 'RISE' | 'FALL' | 'NONE'; // 전일대비부호
  volume: number; // 거래량
  accVolume?: number; // 누적거래량
  amount?: number; // 거래대금
  accAmount?: number; // 누적거래대금
  periodType?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'MINUTE'; // 기간유형
  ema5?: number; // 5일 이동평균
  ema20?: number; // 20일 이동평균
  stockName?: string; // 종목명
  stockCode?: string; // 종목코드
  rawDate?: Date; // 원시 날짜 객체
}

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

// 일봉 데이터 생성 (2024년 1년)
export const dummyChartData: DataPoint[] = [];
const startDate = new Date('2024-01-01T09:00:00');
const basePrice = 377500; // 초기 가격
const volatility = 5000; // 변동성

// 2024년 1년치 일봉 데이터 생성
const currentDate = new Date(startDate);
const endDate = new Date('2024-12-31T15:30:00');

// 종목명과 종목코드 설정
const stockName = '삼성전자';
const stockCode = '005930';

while (currentDate <= endDate) {
  // 주말 제외
  if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
    const prevClose =
      dummyChartData.length === 0 ? basePrice : dummyChartData[dummyChartData.length - 1].close;

    const open = prevClose + (Math.random() - 0.5) * volatility;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    const close = low + Math.random() * (high - low);
    const change = close - prevClose;

    dummyChartData.push({
      date: formatDate(currentDate, 'DAY'),
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      prevClose: Math.round(prevClose),
      change: Math.round(change),
      changeType: change > 0 ? 'RISE' : change < 0 ? 'FALL' : 'NONE',
      volume: Math.floor(500000 + Math.random() * 500000),
      accVolume: 0,
      amount: Math.floor(open * (500000 + Math.random() * 500000)),
      accAmount: 0,
      periodType: 'DAY' as const,
      stockName,
      stockCode,
      rawDate: currentDate,
    });
  }

  // 다음 날로 이동
  currentDate.setDate(currentDate.getDate() + 1);
}

// 누적 거래량과 거래대금 계산
let accVolume = 0;
let accAmount = 0;
dummyChartData.forEach((data) => {
  accVolume += data.volume;
  accAmount += data.amount || 0;
  data.accVolume = accVolume;
  data.accAmount = accAmount;
});

// 1분봉 데이터 생성 (9:00 ~ 15:30, 390분)
const tempMinuteData: DataPoint[] = [];
const today = new Date('2024-01-01T09:00:00');
today.setHours(9, 0, 0, 0);

for (let i = 0; i < 390; i++) {
  const date = new Date(today);
  date.setMinutes(date.getMinutes() + i);

  const prevClose =
    i === 0
      ? dummyChartData[dummyChartData.length - 1].close
      : tempMinuteData[i - 1]?.close || dummyChartData[dummyChartData.length - 1].close;
  const open = prevClose + (Math.random() - 0.5) * (volatility / 10);
  const high = open + Math.random() * (volatility / 10);
  const low = open - Math.random() * (volatility / 10);
  const close = low + Math.random() * (high - low);
  const change = close - prevClose;

  tempMinuteData.push({
    date: formatDate(date, 'MINUTE'),
    open: Math.round(open),
    high: Math.round(high),
    low: Math.round(low),
    close: Math.round(close),
    prevClose: Math.round(prevClose),
    change: Math.round(change),
    changeType: change > 0 ? 'RISE' : change < 0 ? 'FALL' : 'NONE',
    volume: Math.floor(10000 + Math.random() * 10000),
    periodType: 'MINUTE' as const,
    rawDate: date,
  });
}

export const minuteData = tempMinuteData;

// 주봉 데이터 생성
export const weeklyData = dummyChartData.reduce<DataPoint[]>((acc, curr, i) => {
  if (i % 5 === 0) {
    const weekData = dummyChartData.slice(i, i + 5);
    if (weekData.length > 0) {
      const weekDate = new Date(weekData[0].date);
      acc.push({
        ...curr,
        periodType: 'WEEK' as const,
        volume: weekData.reduce((sum, item) => sum + item.volume, 0),
        high: Math.max(...weekData.map((item) => item.high)),
        low: Math.min(...weekData.map((item) => item.low)),
        open: weekData[0].open,
        close: weekData[weekData.length - 1].close,
        date: formatDate(weekDate, 'WEEK'),
        rawDate: weekDate,
      });
    }
  }
  return acc;
}, []);

// 월봉 데이터 생성
export const monthlyData = dummyChartData.reduce<Record<string, DataPoint[]>>((groups, item) => {
  const date = new Date(item.date);
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  if (!groups[key]) {
    groups[key] = [];
  }
  groups[key].push(item);
  return groups;
}, {});

export const monthlyDataArray = Object.values(monthlyData).map((group) => {
  const monthDate = new Date(group[0].date);
  return {
    ...group[0],
    periodType: 'MONTH' as const,
    volume: group.reduce((sum, item) => sum + item.volume, 0),
    high: Math.max(...group.map((item) => item.high)),
    low: Math.min(...group.map((item) => item.low)),
    open: group[0].open,
    close: group[group.length - 1].close,
    date: formatDate(monthDate, 'MONTH'),
    rawDate: monthDate,
  };
});

export const dailyData = dummyChartData.map((data) => ({
  ...data,
  date: formatDate(new Date(data.date), 'DAY'),
  rawDate: new Date(data.date),
}));

export const initialData = dailyData;
