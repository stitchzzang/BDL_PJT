import { DailyChart } from '@/components/ui/chart-daily';
import { MinuteChart } from '@/components/ui/chart-simulate';

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
  return (
    <div>
      <div>
        <button>1</button>
        <button>2</button>
        <button>3</button>
      </div>
      <div>
        <MinuteChart initialData={initialData} />
      </div>
      <div>
        <DailyChart periodType={'day'} />
      </div>
    </div>
  );
};
