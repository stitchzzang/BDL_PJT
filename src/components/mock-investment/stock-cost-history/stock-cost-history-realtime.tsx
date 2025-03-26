import { useEffect, useState } from 'react';

import { TickData } from '@/api/types/stock';
import { getFormatTime } from '@/utils/getTimeFormatted';
import { addCommasToThousand, formatKoreanMoney } from '@/utils/numberFormatter';

interface StockCostHistoryRealTimeProps {
  tickData: TickData | null;
}
export const StockCostHistoryRealTime = ({ tickData }: StockCostHistoryRealTimeProps) => {
  const [tickDataLists, setTickDataLists] = useState<TickData[]>([]);
  useEffect(() => {
    if (tickData) {
      setTickDataLists((prevData) => [tickData, ...prevData]);
    }
  }, [tickData]);
  return (
    <div>
      {!tickDataLists.length ? (
        <div>
          <h1>현재 데이터가 없습니다</h1>
        </div>
      ) : (
        <div className="w-full">
          <div className="flex flex-col space-y-4">
            <div>{/* 실시간, 일별 */}</div>
            <div className="flex flex-col space-y-2">
              {/* 테이블 헤더 */}
              <div className="rounded-lgp-2 flex flex-row">
                <div className="w-[20%] text-[16px] text-border-color">채결가</div>
                <div className="w-[20%] text-right text-[16px] text-border-color">체결량(주)</div>
                <div className="w-[20%] text-right text-[16px] text-border-color">누적 거래량</div>
                <div className="w-[20%] text-right text-[16px] text-border-color">
                  누적 거래대금
                </div>
                <div className="w-[20%] text-right text-[16px] text-border-color">시간</div>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {/* 테이블 로우들 - 배열의 각 항목을 매핑 */}
                {tickDataLists.map((item, index) => (
                  <div
                    key={index}
                    className="my-2 flex flex-row rounded-lg bg-[#102038] p-3 text-white hover:bg-modal-background-color"
                  >
                    <div className="w-[20%] font-medium">
                      {addCommasToThousand(item.stckPrpr)}원
                    </div>
                    <div
                      className={`w-[20%] text-right text-btn-blue-color ${item.ccldDvsn === '1' ? 'text-btn-red-color' : 'text-btn-blue-color'}`}
                    >
                      {item.cntgVol}
                    </div>
                    <div className="w-[20%] text-right">{addCommasToThousand(item.acmlVol)}</div>
                    <div className="w-[20%] text-right font-light text-border-color">
                      {formatKoreanMoney(item.acmlTrPbm)}원
                    </div>
                    <div className="w-[20%] text-right font-light text-border-color">
                      {getFormatTime(item.stckCntgHour)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
