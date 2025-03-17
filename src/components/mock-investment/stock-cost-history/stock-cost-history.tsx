import { useState } from 'react';

import { StockCostHistoryDay } from '@/components/mock-investment/stock-cost-history/stock-cost-history-day';
import { StockCostHistoryRealTime } from '@/components/mock-investment/stock-cost-history/stock-cost-history-realtime';

// 실시간 시세
export interface realTimeData {
  tradePrice: number;
  tradeVolume: number;
  fluctuationRate: number;
  tradingVolume: number;
  tradeTime: string;
}
export type RTData = realTimeData;

// 사용 예시
const stockDataList: RTData[] = [
  {
    tradePrice: 50000,
    tradeVolume: 100,
    fluctuationRate: 2.5,
    tradingVolume: 10000,
    tradeTime: 'YYYY-MM-DD',
  },
  {
    tradePrice: 50000,
    tradeVolume: 100,
    fluctuationRate: 2.5,
    tradingVolume: 10000,
    tradeTime: 'YYYY-MM-DD',
  },
];

export const StockCostHistory = () => {
  const [isActive, setIsActive] = useState<string>('실시간');
  return (
    <div>
      <div>
        <div>
          <button onClick={() => setIsActive('실시간')}>실시간</button>
          <button onClick={() => setIsActive('하루')}>하루</button>
        </div>
        <div>
          {isActive === '실시간' ? (
            <StockCostHistoryRealTime stockDataList={stockDataList} />
          ) : (
            <StockCostHistoryDay />
          )}
        </div>
      </div>
    </div>
  );
};
