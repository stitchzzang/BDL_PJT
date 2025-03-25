import { useState } from 'react';

import { TickData } from '@/api/types/stock';
import { StockCostHistoryDay } from '@/components/mock-investment/stock-cost-history/stock-cost-history-day';
import { StockCostHistoryRealTime } from '@/components/mock-investment/stock-cost-history/stock-cost-history-realtime';

// 실시간 데이터 - 실제
interface StockCostHistoryProps {
  tickData: TickData | null;
}

// 일별 시세
export interface dayData {
  date: string;
  closePrice: number;
  changeRate: number;
  accumulateVolume: number;
  accumulatedTradeAmount: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
}
export type DTData = dayData;
// 더미데이터 2개
const dayDataList: DTData[] = [
  {
    date: '2025-03-17',
    closePrice: 52500,
    changeRate: 1.8,
    accumulateVolume: 458900,
    accumulatedTradeAmount: 23650000000,
    openPrice: 51800,
    highPrice: 52800,
    lowPrice: 51500,
  },
  {
    date: '2025-03-16',
    closePrice: 51600,
    changeRate: -0.6,
    accumulateVolume: 387500,
    accumulatedTradeAmount: 19850000000,
    openPrice: 52000,
    highPrice: 52300,
    lowPrice: 51200,
  },
];

export const StockCostHistory = ({ tickData }: StockCostHistoryProps) => {
  const [isActive, setIsActive] = useState<string>('실시간');
  return (
    <div className="h-full">
      <div className="h-full rounded-2xl bg-modal-background-color p-[20px]">
        <div className="mt-[30px] inline-block rounded-lg bg-btn-primary-inactive-color p-1">
          <button
            onClick={() => setIsActive('실시간')}
            className={`${isActive === '실시간' ? 'bg-btn-primary-active-color' : 'text-border-color'} rounded-lg p-2 transition-all duration-300`}
          >
            실시간
          </button>
          <button
            onClick={() => setIsActive('하루')}
            className={`${isActive === '하루' ? 'bg-btn-primary-active-color' : 'text-border-color'} rounded-lg p-2 transition-all duration-300`}
          >
            하루
          </button>
        </div>
        <div>
          {isActive === '실시간' ? (
            <StockCostHistoryRealTime stockDataList={stockDataList} />
          ) : (
            <StockCostHistoryDay dayDataList={dayDataList} />
          )}
        </div>
      </div>
    </div>
  );
};
