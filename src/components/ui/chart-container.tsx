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
    <div className="h-[100%] rounded-2xl bg-modal-background-color pt-5">
      <div className="inline-block">
        <div className="mx-2 flex gap-2 rounded-xl border p-2 border-border-color">
          <button
            onClick={() => setChartType('minute')}
            className={`rounded-xl p-2 px-4 text-border-color transition-all duration-300 hover:bg-btn-blue-color hover:text-white ${
              chartType === 'minute' ? 'bg-btn-blue-color text-white' : 'bg-modal-background-color'
            }`}
          >
            분 <span className="text-[14px] font-light opacity-40">(1분)</span>
          </button>
          <button
            onClick={() => setChartType('day')}
            className={`rounded-xl p-2 px-4 text-border-color transition-all duration-300 hover:bg-btn-blue-color hover:text-white ${
              chartType === 'day' ? 'bg-btn-blue-color text-white' : 'bg-modal-background-color'
            }`}
          >
            일
          </button>
          <button
            onClick={() => setChartType('week')}
            className={`rounded-xl p-2 px-4 text-border-color transition-all duration-300 hover:bg-btn-blue-color hover:text-white ${
              chartType === 'week' ? 'bg-btn-blue-color text-white' : 'bg-modal-background-color'
            }`}
          >
            주
          </button>
        </div>
      </div>
      <div className="mx-2 mt-[25px] border-b border-border-color  border-opacity-20"></div>
      <div>
        {chartType === 'minute' && <MinuteChart initialData={initialData} />}
        {chartType === 'day' && <DailyChart periodType={'day'} />}
        {chartType === 'week' && <WeekChart periodType={'week'} />}
      </div>
    </div>
  );
};
