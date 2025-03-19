import { DTData } from '@/components/mock-investment/stock-cost-history/stock-cost-history';
import { formatThousandSeparator } from '@/lib/formatThousandSeparator';

interface StockCostHistoryDayProps {
  dayDataList: DTData[];
}
export const StockCostHistoryDay = ({ dayDataList }: StockCostHistoryDayProps) => {
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

            {/* 테이블 로우들 - 배열의 각 항목을 매핑 */}
            {dayDataList.map((item, index) => (
              <div
                key={index}
                className="flex flex-row rounded-lg bg-[#102038] p-3 text-white hover:bg-modal-background-color"
              >
                <div className="w-[20%] font-light text-border-color">{item.date}</div>
                <div className="w-[20%] text-right text-border-color">{item.closePrice}</div>
                <div className="w-[20%] text-right text-btn-red-color">{item.changeRate}%</div>
                <div className="w-[20%] text-right font-light text-border-color">
                  {item.accumulateVolume}
                </div>
                <div className="w-[20%] text-right font-light text-border-color">
                  {formatThousandSeparator(item.accumulatedTradeAmount)}원
                </div>
                <div className="w-[20%] text-right font-light text-border-color">
                  {formatThousandSeparator(item.openPrice)}원
                </div>
                <div className="w-[20%] text-right font-light text-border-color">
                  {item.highPrice} %
                </div>
                <div className="w-[20%] text-right font-light text-border-color">
                  {item.lowPrice}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
