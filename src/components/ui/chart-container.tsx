import { useState } from 'react';

import { DailyChart } from '@/components/ui/chart-daily';
import { MinuteChart } from '@/components/ui/chart-simulate';
import { WeekChart } from '@/components/ui/chart-week';

// 타입 정의 (분봉데이터 - 초기 데이터 적재를 위하여)
interface StockMinuteData {
  stockCandleMinuteId: number;
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
  tradingTime: string;
  fiveAverage: number;
  twentyAverage: number;
}

interface StockMinuteDefaultData {
  companyId: string;
  limit: number;
  cursor: string;
  data: StockMinuteData[];
}

// 차트 데이터 포인트 타입
// interface ChartDataPoint {
//   date: string; // 날짜 표시용
//   open: number;
//   high: number;
//   low: number;
//   close: number;
//   volume: number;
//   changeType: 'RISE' | 'FALL' | 'NONE';
//   fiveAverage: number;
//   twentyAverage: number;
//   rawDate: Date | null;
// }

interface MinuteChartProps {
  companyId?: string;
  initialData?: StockMinuteDefaultData; // 부모 컴포넌트에서 받는 초기 데이터
}

export const ChartContainer = ({ initialData }: MinuteChartProps) => {
  const [chartType, setChartType] = useState<'minute' | 'day' | 'week'>('minute');

  return (
    <div>
      <div>
        <button
          onClick={() => setChartType('minute')}
          style={{ fontWeight: chartType === 'minute' ? 'bold' : 'normal' }}
        >
          분
        </button>
        <button
          onClick={() => setChartType('day')}
          style={{ fontWeight: chartType === 'day' ? 'bold' : 'normal' }}
        >
          일
        </button>
        <button
          onClick={() => setChartType('week')}
          style={{ fontWeight: chartType === 'week' ? 'bold' : 'normal' }}
        >
          주
        </button>
      </div>
      <div>
        {chartType === 'minute' && <MinuteChart initialData={initialData} />}
        {chartType === 'day' && <DailyChart periodType={'day'} />}
        {chartType === 'week' && <WeekChart periodType={'week'} />}
      </div>
    </div>
  );
};
