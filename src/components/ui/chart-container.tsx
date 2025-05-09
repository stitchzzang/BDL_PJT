import { useState } from 'react';

import { DailyChart } from '@/components/ui/chart-daily';
import { MinuteChart } from '@/components/ui/chart-simulate';
import { WeekChart } from '@/components/ui/chart-week';
import { TickCandleChart } from '@/components/ui/tick-chart2';
import { getTodayFormatted } from '@/utils/getTodayFormatted';
import { formatKoreanMoney } from '@/utils/numberFormatter';

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
  closePrice?: number;
}

export const ChartContainer = ({
  initialData,
  companyId,
  tickData,
  closePrice,
}: MinuteChartProps) => {
  const [chartType, setChartType] = useState<'minute' | 'day' | 'week'>('minute');
  const todayInfo = getTodayFormatted();

  return (
    <div className="h-[100%] rounded-2xl bg-modal-background-color p-2 pt-5">
      <div className="flex justify-between text-[14px]">
        <div className="mx-2 flex gap-2 rounded-xl">
          <button
            onClick={() => setChartType('minute')}
            className={`rounded-sm p-1 px-2 text-border-color transition-all duration-300 hover:bg-btn-blue-color hover:text-white ${
              chartType === 'minute'
                ? 'bg-btn-blue-color bg-opacity-20 text-white'
                : 'bg-modal-background-color'
            }`}
          >
            분 <span className="text-[14px] font-light opacity-40">(1분)</span>
          </button>
          <button
            onClick={() => setChartType('day')}
            className={`rounded-sm p-1 px-2 text-border-color transition-all duration-300 hover:bg-btn-blue-color hover:text-white ${
              chartType === 'day'
                ? 'bg-btn-blue-color bg-opacity-20 text-white'
                : 'bg-modal-background-color'
            }`}
          >
            일
          </button>
          <button
            onClick={() => setChartType('week')}
            className={`rounded-sm p-1 px-2 text-border-color transition-all duration-300 hover:bg-btn-blue-color hover:text-white ${
              chartType === 'week'
                ? 'bg-btn-blue-color bg-opacity-20 text-white'
                : 'bg-modal-background-color'
            }`}
          >
            주
          </button>
        </div>
        {tickData ? (
          <div className="flex gap-2 text-border-color">
            <div>
              <p>
                시가:{' '}
                <span className="font-bold text-white">
                  {' '}
                  {formatKoreanMoney(tickData.stckOprc)} 원
                </span>
              </p>
            </div>
            <div>
              <p>
                고가:{' '}
                <span className="font-bold text-white">
                  {' '}
                  {formatKoreanMoney(tickData.stckHgpr)} 원
                </span>
              </p>
            </div>
            <div>
              <p>
                저가:{' '}
                <span className="font-bold text-white">
                  {' '}
                  {formatKoreanMoney(tickData.stckLwpr)} 원
                </span>
              </p>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="mb-[15px] mt-[15px] border-b  border-border-color border-opacity-20"></div>
      {tickData ? (
        <div className="grid grid-cols-10 gap-1">
          <div className="col-span-8">
            {chartType === 'minute' && (
              <MinuteChart initialData={initialData} companyId={companyId} height={440} />
            )}
            {chartType === 'day' && (
              <DailyChart periodType={'day'} companyId={companyId} height={440} />
            )}
            {chartType === 'week' && (
              <WeekChart periodType={'week'} companyId={companyId} height={440} />
            )}
          </div>
          <div className="col-span-2 mb-2  mr-2  rounded-2xl border border-border-color border-opacity-20">
            <TickCandleChart
              tickData={tickData}
              height={180}
              basePrice={tickData.stckOprc} // 초기 기준가
            />
          </div>
        </div>
      ) : (
        <>
          {chartType === 'minute' && (
            <MinuteChart initialData={initialData} companyId={companyId} height={440} />
          )}
          {chartType === 'day' && (
            <DailyChart periodType={'day'} companyId={companyId} height={440} />
          )}
          {chartType === 'week' && (
            <WeekChart periodType={'week'} companyId={companyId} height={440} />
          )}
        </>
      )}
    </div>
  );
};
