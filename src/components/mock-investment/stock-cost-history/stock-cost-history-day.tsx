import { StockDayCandle, TickData } from '@/api/types/stock';
import { getDataFormatted } from '@/utils/getDataFormatted';
import { getTodayFormatted } from '@/utils/getTodayFormatted';
import { formatKoreanMoney } from '@/utils/numberFormatter';

interface StockCostHistoryDayProps {
  DayData: StockDayCandle[] | undefined;
  tickData: TickData | null;
}
export const StockCostHistoryDay = ({ DayData, tickData }: StockCostHistoryDayProps) => {
  return (
    <div>
      <div className="w-full">
        <div className="flex flex-col space-y-4">
          <div>{/* 실시간, 일별 */}</div>
          <div className="flex flex-col space-y-2">
            {/* 테이블 헤더 */}
            <div className="rounded-lgp-2 flex flex-row">
              <div className="w-[20%] text-[16px] text-border-color">일자</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">종가</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">등락률</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">거래량 (주)</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">거래대금</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">시가</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">고가</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">저가</div>
            </div>
            {/* 가장 상단은 항상 최신신 */}
            <div className="flex flex-row rounded-lg bg-[#102038] p-3 text-white hover:bg-modal-background-color">
              <div className="w-[20%] text-[14px] font-light text-border-color">
                {getTodayFormatted()}
              </div>
              <div
                className={`w-[20%] text-right text-[16px] text-border-color ${
                  tickData?.ccldDvsn === '1'
                    ? 'text-btn-red-color'
                    : tickData?.ccldDvsn === '2'
                      ? 'text-btn-blue-color'
                      : 'text-border-color'
                }`}
              >
                {tickData ? formatKoreanMoney(tickData.stckPrpr) : ''}
              </div>
              <div className="w-[20%] text-right text-[16px] font-light text-border-color">
                등락률
              </div>
              <div className="w-[20%] text-right text-[16px] font-light text-border-color">
                {tickData ? formatKoreanMoney(tickData.acmlVol) : ''}
              </div>
              <div className="w-[20%] text-right text-[16px] font-light text-border-color">
                {tickData ? formatKoreanMoney(tickData.acmlTrPbm) : ''} 원
              </div>
              <div className="w-[20%] text-right text-[16px] font-light text-border-color">
                {tickData ? formatKoreanMoney(tickData.stckOprc) : ''} 원
              </div>
              <div className="w-[20%] text-right text-[16px] font-light text-border-color">
                {tickData ? formatKoreanMoney(tickData.stckHgpr) : ''} 원
              </div>
              <div className="w-[20%] text-right text-[16px] font-light text-border-color">
                {tickData ? formatKoreanMoney(tickData.stckLwpr) : ''} 원
              </div>
            </div>
            {/* 테이블 로우들 - 배열의 각 항목을 매핑 */}
            <div
              className="max-h-[450px] animate-fadeIn overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#718096 #1a202c',
              }}
            >
              {DayData?.map((daylist, index) => (
                <div
                  key={index}
                  className="my-2 flex flex-row rounded-lg bg-[#102038] p-3 text-white hover:bg-modal-background-color"
                >
                  <div className="w-[20%] text-[14px] font-light text-border-color">
                    {getDataFormatted(daylist.tradingDate)}
                  </div>
                  <div className="w-[20%] text-right font-light text-border-color">
                    {formatKoreanMoney(daylist.closePrice)}원
                  </div>
                  {daylist.closePricePercent < 0 ? (
                    <div className="w-[20%] text-right text-btn-blue-color">
                      {Math.round(daylist.closePricePercent * 100) / 100}%
                    </div>
                  ) : daylist.closePricePercent === 0 ? (
                    <div className="w-[20%] text-right text-border-color">
                      {Math.round(daylist.closePricePercent * 100) / 100}%
                    </div>
                  ) : (
                    <div className="w-[20%] text-right text-btn-red-color">
                      {Math.round(daylist.closePricePercent * 100) / 100}%
                    </div>
                  )}

                  <div className="w-[20%] text-right font-light text-border-color">
                    {formatKoreanMoney(daylist.accumulatedVolume)}
                  </div>
                  <div className="w-[20%] text-right font-light text-border-color">
                    {formatKoreanMoney(daylist.accumulatedTradeAmount)}원
                  </div>
                  <div className="w-[20%] text-right font-light text-border-color">
                    {formatKoreanMoney(daylist.openPrice)}원
                  </div>
                  <div className="w-[20%] text-right font-light text-border-color">
                    {formatKoreanMoney(daylist.highPrice)}원
                  </div>
                  <div className="w-[20%] text-right font-light text-border-color">
                    {formatKoreanMoney(daylist.lowPrice)}원
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
