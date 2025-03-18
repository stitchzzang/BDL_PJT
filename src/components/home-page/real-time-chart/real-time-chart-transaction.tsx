export interface stockTransaction {
  stockName: string;
  currentPrice: number;
  changeRate: number;
  tradingValue: number;
}

export const RealTimeChartTransaction = () => {
  return (
    <div>
      <div className="w-full">
        <div className="flex flex-col space-y-4">
          <div>{/* 실시간, 일별 */}</div>
          <div className="flex flex-col space-y-2">
            {/* 테이블 헤더 */}
            <div className="rounded-lgp-2 flex flex-row">
              <div className="w-[20%] text-[16px] text-border-color">채결가</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">체결량(주)</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">등락률률</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">거래량 (주)</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">시간</div>
            </div>

            {/* 테이블 로우들 - 배열의 각 항목을 매핑 */}
            {stockDataList.map((item, index) => (
              <div
                key={index}
                className="flex flex-row rounded-lg bg-[#102038] p-3 text-white hover:bg-modal-background-color"
              >
                <div className="w-[20%] font-medium">
                  {formatThousandSeparator(item.tradePrice)}원
                </div>
                <div className="w-[20%] text-right text-btn-blue-color">{item.tradeVolume}</div>
                <div className="w-[20%] text-right text-btn-red-color">{item.fluctuationRate}%</div>
                <div className="w-[20%] text-right font-light text-border-color">
                  {item.tradingVolume}
                </div>
                <div className="w-[20%] text-right font-light text-border-color">
                  {item.tradeTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
