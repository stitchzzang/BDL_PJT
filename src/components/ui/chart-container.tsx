import { useState } from 'react';

import { DailyChart } from '@/components/ui/chart-daily';
import { MinuteChart } from '@/components/ui/chart-simulate';
import { WeekChart } from '@/components/ui/chart-week';
import { TickCandleChart } from '@/components/ui/tick-chart2';
import { getTodayFormatted } from '@/utils/getTodayFormatted';

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

// 틱 데이터 인터페이스
interface TickData {
  stockCode: string;
  stckCntgHour: string;
  stckPrpr: number;
  stckOprc: number;
  stckHgpr: number;
  stckLwpr: number;
  cntgVol: number;
  acmlVol: number;
  acmlTrPbm: number;
  ccldDvsn: string;
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
  companyId?: number;
  initialData?: StockMinuteDefaultData; // 부모 컴포넌트에서 받는 초기 데이터
  tickData?: TickData;
}

export const ChartContainer = ({ initialData, companyId, tickData }: MinuteChartProps) => {
  const [chartType, setChartType] = useState<'minute' | 'day' | 'week'>('minute');
  const todayInfo = getTodayFormatted();

  return (
    <div className="h-[100%] overflow-hidden rounded-2xl bg-modal-background-color p-2 pt-5">
      <div className="flex justify-between text-[14px]">
        <div className="mx-2 flex gap-2 rounded-xl border border-border-color p-2">
          <button
            onClick={() => setChartType('minute')}
            className={`rounded-xl p-2 px-4 text-border-color transition-all duration-300 hover:bg-btn-blue-color hover:text-white ${
              chartType === 'minute'
                ? 'bg-btn-blue-color bg-opacity-20 text-white'
                : 'bg-modal-background-color'
            }`}
          >
            분 <span className="text-[14px] font-light opacity-40">(1분)</span>
          </button>
          <button
            onClick={() => setChartType('day')}
            className={`rounded-xl p-2 px-4 text-border-color transition-all duration-300 hover:bg-btn-blue-color hover:text-white ${
              chartType === 'day'
                ? 'bg-btn-blue-color bg-opacity-20 text-white'
                : 'bg-modal-background-color'
            }`}
          >
            일
          </button>
          <button
            onClick={() => setChartType('week')}
            className={`rounded-xl p-2 px-4 text-border-color transition-all duration-300 hover:bg-btn-blue-color hover:text-white ${
              chartType === 'week'
                ? 'bg-btn-blue-color bg-opacity-20 text-white'
                : 'bg-modal-background-color'
            }`}
          >
            주
          </button>
        </div>
        <div className="flex items-center justify-center gap-1 rounded-xl border border-border-color border-opacity-20 p-4">
          <p className="text-[14px]">{todayInfo}</p>
        </div>
      </div>
      <div className="mb-[15px] mt-[15px] border-b  border-border-color border-opacity-20"></div>
      {tickData ? (
        <div className="grid grid-cols-10">
          <div className="col-span-8">
            {chartType === 'minute' && (
              <MinuteChart initialData={initialData} companyId={companyId} height={250} />
            )}
            {chartType === 'day' && <DailyChart periodType={'day'} companyId={companyId} />}
            {chartType === 'week' && <WeekChart periodType={'week'} companyId={companyId} />}
          </div>
          <div className="col-span-2 mb-2  mr-2  rounded-2xl border border-border-color border-opacity-20">
            <TickCandleChart
              tickData={tickData}
              height={100}
              basePrice={initialData?.data[0]?.openPrice} // 초기 기준가
            />
          </div>
        </div>
      ) : (
        <>
          {chartType === 'minute' && (
            <MinuteChart initialData={initialData} companyId={companyId} height={280} />
          )}
          {chartType === 'day' && <DailyChart periodType={'day'} companyId={companyId} />}
          {chartType === 'week' && <WeekChart periodType={'week'} companyId={companyId} />}
        </>
      )}
    </div>
  );
};
