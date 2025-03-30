import { TickData } from '@/api/types/stock';
import { ChartLoadingAnimation } from '@/components/common/chart-loading-animation';
import { getFormatTime } from '@/utils/getTimeFormatted';
import { addCommasToThousand, formatKoreanMoney } from '@/utils/numberFormatter';

interface StockCostHistoryRealTimeProps {
  tickDataLists: TickData[];
  animationKey: number;
}

export const StockCostHistoryRealTime = ({
  tickDataLists,
  animationKey,
}: StockCostHistoryRealTimeProps) => {
  return (
    <div>
      {!tickDataLists.length ? (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <ChartLoadingAnimation />
          <div>
            <h1>현재 장 시간이 아닙니다.</h1>
          </div>
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
