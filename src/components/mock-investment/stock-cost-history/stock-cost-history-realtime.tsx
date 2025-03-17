export const StockCostHistoryRealTime = () => {
  return (
    <div>
      <div className="w-full">
        <div className="flex flex-col space-y-4">
          <div>{/* 실시간, 일별 */}</div>
          <div className="flex flex-col space-y-2">
            {/* 테이블 헤더 */}
            <div className="rounded-lgp-2 flex flex-row">
              <div className="w-[20%] text-[16px] text-border-color">채결가</div>
              <div className="w-[20%] text-[16px] text-border-color">체결량(주)</div>
              <div className="w-[20%] text-[16px] text-border-color">등락률률</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">거래량 (주)</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">시간</div>
            </div>

            {/* 테이블 로우들 */}
            <div className="flex flex-row rounded-lg bg-[#102038] p-2 text-white">
              <div className="w-[20%] font-medium">INV001</div>
              <div className="w-[20%]">Paid</div>
              <div className="w-[20%]">Credit Card</div>
              <div className="w-[20%] text-right">$250.00</div>
              <div className="w-[20%] text-right">13:32:23</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
