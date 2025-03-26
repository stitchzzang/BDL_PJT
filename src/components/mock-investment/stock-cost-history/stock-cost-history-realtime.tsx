import { useEffect, useState } from 'react';

import { TickData } from '@/api/types/stock';
import { getFormatTime } from '@/utils/getTimeFormatted';
import { addCommasToThousand, formatKoreanMoney } from '@/utils/numberFormatter';

interface StockCostHistoryRealTimeProps {
  tickData: TickData | null;
}
export const StockCostHistoryRealTime = ({ tickData }: StockCostHistoryRealTimeProps) => {
  const [tickDataLists, setTickDataLists] = useState<TickData[]>([]);
  const [animationKey, setAnimationKey] = useState<number>(0);

  // 스크롤바 스타일을 객체로 정의
  const scrollbarStyle = {
    scrollbarWidth: 'thin', // Firefox
    scrollbarColor: '#718096 #1a202c', // Firefox
    msOverflowStyle: 'auto', // IE and Edge
    '&::-webkit-scrollbar': {
      width: '15px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#1a202c',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#718096',
      borderRadius: '6px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#5a6887',
    },
  };

  useEffect(() => {
    if (tickData) {
      setTickDataLists((prevData) => [tickData, ...prevData]);
      // 애니메이션을 위한 코드
      setAnimationKey((prev) => prev + 1);
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
              <div
                className="max-h-[450px] animate-fadeIn overflow-y-auto"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#718096 #1a202c',
                }}
              >
                {/* 테이블 로우들 - 배열의 각 항목을 매핑 */}
                {tickDataLists.map((item, index) => (
                  <div
                    // 첫 번째 항목에는 변경되는 키를, 나머지는 인덱스 키를 사용
                    key={index === 0 ? `item-${animationKey}` : index}
                    className={`my-2 flex flex-row rounded-lg bg-[#102038] p-3 text-white hover:bg-modal-background-color ${index === 0 ? 'animate-fadeIn' : ''}`}
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
