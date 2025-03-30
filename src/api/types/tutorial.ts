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

// // API 응답 타입
// export interface CandleResponse<T> {
//     companyId: string;
//     limit: number;
//     cursor: string | null;
//     data: T[];
// }
