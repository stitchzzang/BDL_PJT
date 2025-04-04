import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

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

  // 한국 시간 체크하는 함수 - 틱 정보 유무로 체크가 힘들어... 시간을 체크해서 기능 적용
  const checkKoreanTradingHours = () => {
    // 현재 UTC 시간을 가져옴
    const now = new Date();

    // 한국 시간으로 변환 (UTC+9)
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    // 한국 시간 기준 시간과 분 추출
    const hours = koreaTime.getUTCHours();
    const minutes = koreaTime.getUTCMinutes();

    // 현재 시간을 분 단위로 환산 (9:00 = 540분, 15:30 = 930분)
    const currentTimeInMinutes = hours * 60 + minutes;

    // 거래 시간인지 확인 (09:00 ~ 15:30)
    return currentTimeInMinutes >= 540 && currentTimeInMinutes <= 930;
  };

  // 컴포넌트 마운트 시 및 주기적으로 시간 체크
  useEffect(() => {
    // 초기 시간 체크
    if (!checkKoreanTradingHours()) {
      setIsActive('일별');
    }

    // 1분마다 체크하여 거래 시간이 아니면 '일별'로 변경
    const timer = setInterval(() => {
      if (!checkKoreanTradingHours()) {
        setIsActive('일별');
      }
    }, 60000); // 1분 간격으로 체크

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearInterval(timer);
  }, []);

  // tickData가 변경될 때마다 리스트에 추가 (실시간 정보)
  useEffect(() => {
    if (tickData) {
      setTickDataLists((prevData) => [tickData, ...prevData]);
      setAnimationKey((prev) => prev + 1);
    }
  }, [tickData]);

  // 버튼 클릭 핸들러 - 거래 시간에만 '실시간' 선택 가능
  const handleModeChange = (mode: string) => {
    if (mode === '실시간' && !checkKoreanTradingHours()) {
      // 거래 시간이 아니면 '실시간' 모드로 변경 불가
      toast.error('거래 시간(09:00~15:30)에만 실시간 정보를 볼 수 있습니다.');
      return;
    }
    setIsActive(mode);
  };

  return (
    <div className="h-full">
      <div className="h-full rounded-2xl bg-modal-background-color p-[20px]">
        <div className="mt-[30px] inline-block rounded-lg bg-btn-primary-inactive-color p-1">
          <button
            onClick={() => handleModeChange('실시간')}
            className={`${isActive === '실시간' ? 'bg-btn-primary-active-color' : 'text-border-color'} rounded-lg p-2 text-[14px] transition-all duration-300`}
          >
            실시간
          </button>
          <button
            onClick={() => handleModeChange('일별')}
            className={`${isActive === '일별' ? 'bg-btn-primary-active-color' : 'text-border-color'} rounded-lg p-2 text-[14px] transition-all duration-300`}
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
