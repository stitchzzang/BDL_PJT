import { useState } from 'react';

import { StockCostHistoryDay } from '@/components/mock-investment/stock-cost-history/stock-cost-history-day';
import { StockCostHistoryRealTime } from '@/components/mock-investment/stock-cost-history/stock-cost-history-realtime';

export const StockCostHistory = () => {
  const [isActive, setIsActive] = useState<string>('실시간');
  return (
    <div>
      <div>
        <div>
          <button onClick={() => setIsActive('실시간')}>실시간</button>
          <button onClick={() => setIsActive('하루')}>하루</button>
        </div>
        <div>{isActive === '실시간' ? <StockCostHistoryRealTime /> : <StockCostHistoryDay />}</div>
      </div>
    </div>
  );
};
