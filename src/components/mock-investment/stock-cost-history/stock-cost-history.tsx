import { useEffect, useState } from 'react';

import { StockDayCandle, TickData } from '@/api/types/stock';
import { StockCostHistoryDay } from '@/components/mock-investment/stock-cost-history/stock-cost-history-day';
import { StockCostHistoryRealTime } from '@/components/mock-investment/stock-cost-history/stock-cost-history-realtime';

// 실시간 데이터 - 실제
interface StockCostHistoryProps {
  tickData: TickData | null;
  DayData: StockDayCandle[] | undefined;
}

export const StockCostHistory = ({ tickData, DayData }: StockCostHistoryProps) => {
  const [isActive, setIsActive] = useState<string>('실시간');
  // 실시간 정보 관리
  const [tickDataLists, setTickDataLists] = useState<TickData[]>([]);
  const [animationKey, setAnimationKey] = useState<number>(0);

  // useEffect(() => {
  //   if (tickData === null) {
  //     setIsActive('일별');
  //   }
  // }, []);

  // tickData가 변경될 때마다 리스트에 추가 (실시간 정보)
  useEffect(() => {
    if (tickData) {
      setTickDataLists((prevData) => [tickData, ...prevData]);
      setAnimationKey((prev) => prev + 1);
    }
  }, [tickData]);
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
            onClick={() => setIsActive('일별')}
            className={`${isActive === '일별' ? 'bg-btn-primary-active-color' : 'text-border-color'} rounded-lg p-2 transition-all duration-300`}
          >
            일별
          </button>
        </div>
        <div>
          {isActive === '실시간' ? (
            <StockCostHistoryRealTime tickDataLists={tickDataLists} animationKey={animationKey} />
          ) : (
            <StockCostHistoryDay DayData={DayData} tickData={tickData} />
          )}
        </div>
      </div>
    </div>
  );
};
